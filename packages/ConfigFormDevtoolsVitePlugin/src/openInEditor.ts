import type { IncomingMessage, ServerResponse } from 'node:http'
import type {
  EditorCommand,
  EditorCommandInput,
  OpenInEditorOptions,
  OpenInEditorPayload,
  SpawnEditorProcess,
} from './types'
import { Buffer } from 'node:buffer'
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { isAbsolute, relative, resolve } from 'node:path'
import process from 'node:process'
import { ConfigFormDevtoolsHttpError } from './types'

interface ResolveAllowedFileInput {
  file: string
  root: string
  allowRoots?: string[]
}

function normalizePath(input: string): string {
  return input.replace(/\\/g, '/')
}

function isInsideRoot(file: string, root: string): boolean {
  const relativePath = relative(root, file)
  return relativePath === '' || (!relativePath.startsWith('..') && !isAbsolute(relativePath))
}

function resolveEditorExecutable(editor: string): Pick<EditorCommand, 'command' | 'shell'> {
  if (process.platform === 'win32' && ['code', 'cursor', 'webstorm'].includes(editor)) {
    return {
      command: `${editor}.cmd`,
      shell: true,
    }
  }

  return { command: editor }
}

export function parseOpenInEditorPayload(input: unknown): OpenInEditorPayload {
  if (!input || typeof input !== 'object')
    throw new ConfigFormDevtoolsHttpError(400, 'Open-in-editor payload must be an object')

  const payload = input as Partial<OpenInEditorPayload>
  if (typeof payload.file !== 'string' || payload.file.length === 0)
    throw new ConfigFormDevtoolsHttpError(400, 'file must be a non-empty string')
  if (!Number.isInteger(payload.line) || Number(payload.line) <= 0)
    throw new ConfigFormDevtoolsHttpError(400, 'line must be a positive integer')
  if (!Number.isInteger(payload.column) || Number(payload.column) <= 0)
    throw new ConfigFormDevtoolsHttpError(400, 'column must be a positive integer')

  const line = Number(payload.line)
  const column = Number(payload.column)

  return {
    column,
    file: payload.file,
    line,
  }
}

export function resolveAllowedFile(input: ResolveAllowedFileInput): string {
  const file = resolve(input.file)
  const roots = [input.root, ...(input.allowRoots ?? [])].map(root => resolve(root))

  if (!roots.some(root => isInsideRoot(file, root))) {
    throw new ConfigFormDevtoolsHttpError(
      403,
      `File is outside the allowed roots: ${normalizePath(file)}`,
    )
  }

  return normalizePath(file)
}

export function createEditorCommand(input: EditorCommandInput): EditorCommand {
  if (input.editor && typeof input.editor === 'object')
    return input.editor

  const editor = input.editor ?? 'code'
  const executable = resolveEditorExecutable(editor)

  if (editor === 'webstorm') {
    return {
      args: [`${input.file}:${input.line}:${input.column}`],
      ...executable,
    }
  }

  return {
    args: ['-g', `${input.file}:${input.line}:${input.column}`],
    ...executable,
  }
}

export function launchEditor(
  command: EditorCommand,
  spawnEditor: SpawnEditorProcess = spawn,
): Promise<void> {
  return new Promise((resolveLaunch, rejectLaunch) => {
    let settled = false
    const child = spawnEditor(command.command, command.args, {
      detached: true,
      ...(command.shell ? { shell: true } : {}),
      stdio: 'ignore',
    })

    function settle(error?: Error) {
      if (settled)
        return

      settled = true
      if (error) {
        rejectLaunch(error)
        return
      }

      child.unref()
      resolveLaunch()
    }

    child.once('error', error => settle(error instanceof Error ? error : new Error(String(error))))

    if (command.shell) {
      child.once('exit', (code, signal) => {
        if (typeof code === 'number' && code !== 0) {
          settle(new Error(`Editor command "${command.command}" exited with code ${code}`))
          return
        }

        if (signal) {
          settle(new Error(`Editor command "${command.command}" exited with signal ${signal}`))
          return
        }

        settle()
      })
      return
    }

    child.once('spawn', () => {
      settle()
    })
  })
}

export async function openInEditor(payload: unknown, options: OpenInEditorOptions): Promise<EditorCommand> {
  const parsed = parseOpenInEditorPayload(payload)
  const file = resolveAllowedFile({
    allowRoots: options.allowRoots,
    file: parsed.file,
    root: options.root,
  })

  if (!existsSync(file))
    throw new ConfigFormDevtoolsHttpError(404, `File does not exist: ${file}`)

  const command = createEditorCommand({
    ...parsed,
    editor: options.editor,
    file,
  })
  await launchEditor(command, options.spawn)
  return command
}

function readRequestBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolveBody, rejectBody) => {
    const chunks: Buffer[] = []
    req.on('data', chunk => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk))))
    req.on('error', rejectBody)
    req.on('end', () => resolveBody(Buffer.concat(chunks).toString('utf8')))
  })
}

function sendJson(res: ServerResponse, statusCode: number, payload: Record<string, unknown>) {
  res.statusCode = statusCode
  res.setHeader('content-type', 'application/json')
  res.end(JSON.stringify(payload))
}

export function createOpenInEditorMiddleware(options: OpenInEditorOptions) {
  return async (req: IncomingMessage, res: ServerResponse) => {
    if (req.method !== 'POST') {
      sendJson(res, 405, { error: 'Method not allowed' })
      return
    }

    try {
      const rawBody = await readRequestBody(req)
      const payload = rawBody ? JSON.parse(rawBody) : {}
      const command = await openInEditor(payload, options)
      sendJson(res, 200, { command })
    }
    catch (error) {
      if (error instanceof ConfigFormDevtoolsHttpError) {
        sendJson(res, error.statusCode, { error: error.message })
        return
      }

      const message = error instanceof Error ? error.message : String(error)
      sendJson(res, 500, { error: message })
    }
  }
}
