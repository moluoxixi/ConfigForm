import type { ChildProcess } from 'node:child_process'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { EventEmitter } from 'node:events'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import process from 'node:process'
import { Readable } from 'node:stream'
import { describe, expect, it, vi } from 'vitest'
import {
  createEditorCommand,
  createOpenInEditorMiddleware,
  launchEditor,
  openInEditor,
  parseOpenInEditorPayload,
  resolveAllowedFile,
} from '../src/openInEditor'

function createSpawnMock(event: 'error' | 'exit' | 'spawn', result: unknown = new Error('spawn failed')) {
  return vi.fn(() => {
    const child = new EventEmitter() as ChildProcess
    child.unref = vi.fn()

    queueMicrotask(() => {
      if (event === 'error') {
        child.emit('error', result)
      }
      else if (event === 'exit') {
        child.emit('spawn')
        child.emit('exit', typeof result === 'number' ? result : 1)
      }
      else {
        child.emit('spawn')
        child.emit('exit', 0)
      }
    })

    return child
  })
}

function createRequest(method: string, body = ''): IncomingMessage {
  const req = new Readable({
    read() {
      this.push(body)
      this.push(null)
    },
  }) as IncomingMessage
  req.method = method
  return req
}

function createResponse() {
  const response = {
    body: '',
    headers: {} as Record<string, string>,
    statusCode: 0,
    end: vi.fn((body: string) => {
      response.body = body
      return response
    }),
    setHeader: vi.fn((name: string, value: string) => {
      response.headers[name] = value
      return response
    }),
  }
  return response as unknown as ServerResponse & typeof response
}

describe('open in editor helpers', () => {
  it('creates code-compatible editor commands', () => {
    const command = createEditorCommand({
      column: 7,
      editor: 'code',
      file: 'D:/project-new/ConfigForm/playgrounds/demo.vue',
      line: 12,
    })

    expect(command).toEqual({
      args: ['-g', 'D:/project-new/ConfigForm/playgrounds/demo.vue:12:7'],
      command: process.platform === 'win32' ? 'code.cmd' : 'code',
      ...(process.platform === 'win32' ? { shell: true } : {}),
    })
  })

  it('keeps preset editor commands direct outside Windows', () => {
    const platform = vi.spyOn(process, 'platform', 'get').mockReturnValue('linux')

    expect(createEditorCommand({
      column: 7,
      editor: 'cursor',
      file: '/project/ConfigForm/playgrounds/demo.vue',
      line: 12,
    })).toEqual({
      args: ['-g', '/project/ConfigForm/playgrounds/demo.vue:12:7'],
      command: 'cursor',
    })

    platform.mockRestore()
  })

  it('rejects invalid open payloads', () => {
    expect(() => parseOpenInEditorPayload({ file: 'demo.vue', line: 0, column: 1 }))
      .toThrow(/line must be a positive integer/)
  })

  it('rejects invalid object shapes', () => {
    expect(() => parseOpenInEditorPayload(null)).toThrow(/payload must be an object/)
    expect(() => parseOpenInEditorPayload({ file: '', line: 1, column: 1 })).toThrow(/file must/)
    expect(() => parseOpenInEditorPayload({ file: 'demo.vue', line: 1, column: 0 })).toThrow(/column must/)
  })

  it('rejects files outside the configured root', () => {
    expect(() => resolveAllowedFile({
      allowRoots: [],
      file: 'D:/project-new/Other/demo.vue',
      root: 'D:/project-new/ConfigForm',
    })).toThrow(/outside the allowed roots/)
  })

  it('allows files inside configured allow roots', () => {
    expect(resolveAllowedFile({
      allowRoots: ['D:/project-new/Other'],
      file: 'D:/project-new/Other/demo.vue',
      root: 'D:/project-new/ConfigForm',
    })).toBe('D:/project-new/Other/demo.vue')
  })

  it('creates webstorm and custom editor commands', () => {
    expect(createEditorCommand({
      column: 7,
      editor: 'webstorm',
      file: 'D:/project-new/ConfigForm/playgrounds/demo.vue',
      line: 12,
    })).toEqual({
      args: ['D:/project-new/ConfigForm/playgrounds/demo.vue:12:7'],
      command: process.platform === 'win32' ? 'webstorm.cmd' : 'webstorm',
      ...(process.platform === 'win32' ? { shell: true } : {}),
    })

    expect(createEditorCommand({
      column: 7,
      editor: { args: ['open'], command: 'custom-editor' },
      file: 'D:/project-new/ConfigForm/playgrounds/demo.vue',
      line: 12,
    })).toEqual({ args: ['open'], command: 'custom-editor' })
  })

  it('launches editor commands and reports spawn failures', async () => {
    const spawnSuccess = createSpawnMock('spawn')
    await expect(launchEditor({ args: ['-g', 'demo.vue:1:1'], command: 'code' }, spawnSuccess)).resolves.toBeUndefined()
    expect(spawnSuccess).toHaveBeenCalledWith('code', ['-g', 'demo.vue:1:1'], {
      detached: true,
      stdio: 'ignore',
    })

    await expect(launchEditor(
      { args: ['-g', 'demo.vue:1:1'], command: 'missing-editor' },
      createSpawnMock('error'),
    )).rejects.toThrow(/spawn failed/)

    await expect(launchEditor(
      { args: ['-g', 'demo.vue:1:1'], command: 'missing-editor.cmd', shell: true },
      createSpawnMock('exit', 1),
    )).rejects.toThrow(/exited with code 1/)

    await expect(launchEditor(
      { args: ['-g', 'demo.vue:1:1'], command: 'killed-editor.cmd', shell: true },
      vi.fn(() => {
        const child = new EventEmitter() as ChildProcess
        child.unref = vi.fn()
        queueMicrotask(() => child.emit('exit', null, 'SIGTERM'))
        return child
      }),
    )).rejects.toThrow(/exited with signal SIGTERM/)
  })

  it('opens existing files with injected spawn implementation', async () => {
    const root = mkdtempSync(join(tmpdir(), 'cf-devtools-'))
    const file = join(root, 'demo.vue')
    writeFileSync(file, '<template />')

    await expect(openInEditor(
      { column: 1, file, line: 1 },
      { root, spawn: createSpawnMock('spawn') },
    )).resolves.toMatchObject({
      command: process.platform === 'win32' ? 'code.cmd' : 'code',
    })
  })

  it('rejects missing files during open', async () => {
    const root = mkdtempSync(join(tmpdir(), 'cf-devtools-'))

    await expect(openInEditor(
      { column: 1, file: join(root, 'missing.vue'), line: 1 },
      { root, spawn: createSpawnMock('spawn') },
    )).rejects.toThrow(/File does not exist/)
  })

  it('handles middleware method, validation, success, and unexpected failures', async () => {
    const root = mkdtempSync(join(tmpdir(), 'cf-devtools-'))
    const file = join(root, 'demo.vue')
    writeFileSync(file, '<template />')

    const methodResponse = createResponse()
    await createOpenInEditorMiddleware({ root })(createRequest('GET'), methodResponse)
    expect(methodResponse.statusCode).toBe(405)

    const invalidResponse = createResponse()
    await createOpenInEditorMiddleware({ root })(createRequest('POST', '{"file":""}'), invalidResponse)
    expect(invalidResponse.statusCode).toBe(400)

    const emptyResponse = createResponse()
    await createOpenInEditorMiddleware({ root })(createRequest('POST'), emptyResponse)
    expect(emptyResponse.statusCode).toBe(400)

    const successResponse = createResponse()
    await createOpenInEditorMiddleware({ root, spawn: createSpawnMock('spawn') })(
      createRequest('POST', JSON.stringify({ column: 1, file, line: 1 })),
      successResponse,
    )
    expect(successResponse.statusCode).toBe(200)
    expect(successResponse.body).toContain('"command"')

    const failureResponse = createResponse()
    await createOpenInEditorMiddleware({ root })(createRequest('POST', '{'), failureResponse)
    expect(failureResponse.statusCode).toBe(500)

    const nonErrorResponse = createResponse()
    await createOpenInEditorMiddleware({ root, spawn: createSpawnMock('error', 'plain failure') })(
      createRequest('POST', JSON.stringify({ column: 1, file, line: 1 })),
      nonErrorResponse,
    )
    expect(nonErrorResponse.statusCode).toBe(500)
    expect(nonErrorResponse.body).toContain('plain failure')
  })
})
