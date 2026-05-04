import type { SetDevtoolsMessage, StoredNode } from './types'

interface OpenSourceCommandPayload {
  args?: unknown
  command?: unknown
}

function formatOpenSourceCommand(payload: unknown): string | undefined {
  if (!payload || typeof payload !== 'object')
    return undefined

  const command = (payload as { command?: OpenSourceCommandPayload }).command
  if (!command || typeof command !== 'object' || typeof command.command !== 'string')
    return undefined

  const args = Array.isArray(command.args)
    ? command.args.filter((arg): arg is string => typeof arg === 'string')
    : []

  return [command.command, ...args].join(' ')
}

export async function openNodeSource(node: StoredNode, setMessage: SetDevtoolsMessage): Promise<void> {
  const source = node.source
  if (!source) {
    setMessage('No source location for selected field/component')
    return
  }

  const response = await fetch('/__config-form-devtools/open', {
    body: JSON.stringify({
      column: source.column,
      file: source.file,
      line: source.line,
    }),
    headers: { 'content-type': 'application/json' },
    method: 'POST',
  })
  const text = await response.text()

  if (!response.ok) {
    try {
      const payload = JSON.parse(text) as { error?: unknown }
      setMessage(typeof payload.error === 'string' ? payload.error : text)
    }
    catch {
      setMessage(text)
    }
    return
  }

  try {
    const command = formatOpenSourceCommand(JSON.parse(text))
    setMessage(command ? `Opened source: ${command}` : '')
  }
  catch {
    setMessage('')
  }
}
