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

/**
 * 创建可控的编辑器进程启动 mock。
 *
 * 通过微任务触发 spawn/error/exit，模拟 child_process 在不同平台上的异步事件顺序。
 */
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

/**
 * 创建 middleware 测试用请求流。
 *
 * body 会被一次性推入 Readable，便于覆盖空请求体和非法 JSON。
 */
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

/**
 * 创建可观察的 ServerResponse mock。
 *
 * 记录 statusCode、headers 和 body，避免测试依赖真实 HTTP server。
 */
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
  it('creates non-Windows code-compatible editor commands through launch-editor mappings', () => {
    const platform = vi.spyOn(process, 'platform', 'get').mockReturnValue('linux')

    try {
      const command = createEditorCommand({
        column: 7,
        editor: 'code',
        file: 'D:/project-new/ConfigForm/playgrounds/demo.vue',
        line: 12,
      })

      expect(command).toEqual({
        args: ['-r', '-g', 'D:/project-new/ConfigForm/playgrounds/demo.vue:12:7'],
        command: 'code',
      })
    }
    finally {
      platform.mockRestore()
    }
  })

  it('creates Windows preset editor commands and direct WebStorm exe launches', () => {
    const platform = vi.spyOn(process, 'platform', 'get').mockReturnValue('win32')

    try {
      expect(createEditorCommand({
        column: 7,
        editor: 'code',
        file: 'D:/project-new/ConfigForm/playgrounds/demo.vue',
        line: 12,
      })).toEqual({
        args: ['-r', '-g', 'D:/project-new/ConfigForm/playgrounds/demo.vue:12:7'],
        command: 'code',
        shell: true,
      })

      expect(createEditorCommand({
        column: 7,
        editor: 'cursor',
        file: 'D:/project-new/ConfigForm/playgrounds/demo.vue',
        line: 12,
      })).toEqual({
        args: ['-r', '-g', 'D:/project-new/ConfigForm/playgrounds/demo.vue:12:7'],
        command: 'cursor',
        shell: true,
      })

      expect(createEditorCommand({
        column: 7,
        editor: 'webstorm',
        file: 'D:/project-new/ConfigForm/playgrounds/demo.vue',
        line: 12,
      })).toEqual({
        args: ['--line', '12', '--column', '7', 'D:/project-new/ConfigForm/playgrounds/demo.vue'],
        command: 'webstorm64.exe',
      })

      expect(createEditorCommand({
        column: 7,
        editor: 'D:\\code\\WebStorm 2025.3.2\\bin\\webstorm64.exe',
        file: 'D:\\project-new\\ConfigForm\\playgrounds\\demo.vue',
        line: 12,
      })).toEqual({
        args: ['--line', '12', '--column', '7', 'D:\\project-new\\ConfigForm\\playgrounds\\demo.vue'],
        command: 'D:\\code\\WebStorm 2025.3.2\\bin\\webstorm64.exe',
      })
    }
    finally {
      platform.mockRestore()
    }
  })

  it('keeps preset editor commands direct outside Windows', () => {
    const platform = vi.spyOn(process, 'platform', 'get').mockReturnValue('linux')

    try {
      expect(createEditorCommand({
        column: 7,
        editor: 'cursor',
        file: '/project/ConfigForm/playgrounds/demo.vue',
        line: 12,
      })).toEqual({
        args: ['-r', '-g', '/project/ConfigForm/playgrounds/demo.vue:12:7'],
        command: 'cursor',
      })
    }
    finally {
      platform.mockRestore()
    }
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
    }).replace(/\\/g, '/')).toBe('D:/project-new/Other/demo.vue')
  })

  it('creates webstorm and custom editor commands', () => {
    const platform = vi.spyOn(process, 'platform', 'get').mockReturnValue('linux')

    try {
      expect(createEditorCommand({
        column: 7,
        editor: 'sublime',
        file: 'D:/project-new/ConfigForm/playgrounds/demo.vue',
        line: 12,
      })).toEqual({
        args: ['D:/project-new/ConfigForm/playgrounds/demo.vue:12:7'],
        command: 'sublime',
      })

      expect(createEditorCommand({
        column: 7,
        editor: 'webstorm',
        file: 'D:/project-new/ConfigForm/playgrounds/demo.vue',
        line: 12,
      })).toEqual({
        args: ['--line', '12', '--column', '7', 'D:/project-new/ConfigForm/playgrounds/demo.vue'],
        command: 'webstorm',
      })

      expect(createEditorCommand({
        column: 7,
        editor: { args: ['open'], command: 'custom-editor' },
        file: 'D:/project-new/ConfigForm/playgrounds/demo.vue',
        line: 12,
      })).toEqual({ args: ['open'], command: 'custom-editor' })
    }
    finally {
      platform.mockRestore()
    }
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
    )).rejects.toThrow(/Failed to start editor command "missing-editor -g demo.vue:1:1": spawn failed/)

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
    const platform = vi.spyOn(process, 'platform', 'get').mockReturnValue('linux')
    const root = mkdtempSync(join(tmpdir(), 'cf-devtools-'))
    const file = join(root, 'demo.vue')
    writeFileSync(file, '<template />')

    try {
      await expect(openInEditor(
        { column: 1, file, line: 1 },
        { editor: 'code', root, spawn: createSpawnMock('spawn') },
      )).resolves.toMatchObject({
        command: 'code',
      })
    }
    finally {
      platform.mockRestore()
    }
  })

  it('opens WebStorm on Windows through the exe launcher without shell splitting', async () => {
    const platform = vi.spyOn(process, 'platform', 'get').mockReturnValue('win32')
    const root = mkdtempSync(join(tmpdir(), 'cf-devtools-'))
    const file = join(root, 'demo.vue')
    const spawnEditor = createSpawnMock('spawn')
    writeFileSync(file, '<template />')

    try {
      await expect(openInEditor(
        { column: 3, file, line: 2 },
        { editor: 'webstorm', root, spawn: spawnEditor },
      )).resolves.toMatchObject({
        command: 'webstorm64.exe',
      })

      expect(spawnEditor).toHaveBeenCalledWith('webstorm64.exe', ['--line', '2', '--column', '3', file], {
        detached: true,
        stdio: 'ignore',
      })
    }
    finally {
      platform.mockRestore()
    }
  })

  it('opens auto-detected WebStorm on Windows without requiring an editor option', async () => {
    const platform = vi.spyOn(process, 'platform', 'get').mockReturnValue('win32')
    const previousLaunchEditor = process.env.LAUNCH_EDITOR
    const root = mkdtempSync(join(tmpdir(), 'cf-devtools-'))
    const file = join(root, 'demo.vue')
    const webstorm = 'D:\\code\\WebStorm 2025.3.2\\bin\\webstorm64.exe'
    const spawnEditor = createSpawnMock('spawn')
    process.env.LAUNCH_EDITOR = webstorm
    writeFileSync(file, '<template />')

    try {
      await expect(openInEditor(
        { column: 5, file, line: 4 },
        { root, spawn: spawnEditor },
      )).resolves.toMatchObject({
        command: webstorm,
      })

      expect(spawnEditor).toHaveBeenCalledWith(webstorm, ['--line', '4', '--column', '5', file], {
        detached: true,
        stdio: 'ignore',
      })
    }
    finally {
      if (previousLaunchEditor === undefined)
        delete process.env.LAUNCH_EDITOR
      else
        process.env.LAUNCH_EDITOR = previousLaunchEditor
      platform.mockRestore()
    }
  })

  it('rejects missing files during open', async () => {
    const root = mkdtempSync(join(tmpdir(), 'cf-devtools-'))

    await expect(openInEditor(
      { column: 1, file: join(root, 'missing.vue'), line: 1 },
      { editor: 'code', root, spawn: createSpawnMock('spawn') },
    )).rejects.toThrow(/File does not exist/)
  })

  it('handles middleware method, validation, success, and unexpected failures', async () => {
    const root = mkdtempSync(join(tmpdir(), 'cf-devtools-'))
    const file = join(root, 'demo.vue')
    writeFileSync(file, '<template />')

    const methodResponse = createResponse()
    await createOpenInEditorMiddleware({ editor: 'code', root })(createRequest('GET'), methodResponse)
    expect(methodResponse.statusCode).toBe(405)

    const invalidResponse = createResponse()
    await createOpenInEditorMiddleware({ editor: 'code', root })(createRequest('POST', '{"file":""}'), invalidResponse)
    expect(invalidResponse.statusCode).toBe(400)

    const emptyResponse = createResponse()
    await createOpenInEditorMiddleware({ editor: 'code', root })(createRequest('POST'), emptyResponse)
    expect(emptyResponse.statusCode).toBe(400)

    const successResponse = createResponse()
    await createOpenInEditorMiddleware({ editor: 'code', root, spawn: createSpawnMock('spawn') })(
      createRequest('POST', JSON.stringify({ column: 1, file, line: 1 })),
      successResponse,
    )
    expect(successResponse.statusCode).toBe(200)
    expect(successResponse.body).toContain('"command"')

    const failureResponse = createResponse()
    await createOpenInEditorMiddleware({ editor: 'code', root })(createRequest('POST', '{'), failureResponse)
    expect(failureResponse.statusCode).toBe(500)

    const nonErrorResponse = createResponse()
    await createOpenInEditorMiddleware({ editor: 'code', root, spawn: createSpawnMock('error', 'plain failure') })(
      createRequest('POST', JSON.stringify({ column: 1, file, line: 1 })),
      nonErrorResponse,
    )
    expect(nonErrorResponse.statusCode).toBe(500)
    expect(nonErrorResponse.body).toContain('plain failure')
  })
})
