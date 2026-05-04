import type { SetDevtoolsMessage, StoredNode } from './types'

interface OpenSourceCommandPayload {
  args?: unknown
  command?: unknown
}

/**
 * 从 open-in-editor 响应中提取可展示命令。
 *
 * 只展示字符串命令和字符串参数，未知结构按无命令处理。
 */
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

/**
 * 请求开发服务器打开节点源码位置。
 *
 * HTTP 失败会把服务端错误展示到面板；网络或 fetch 异常保持抛出给调用方。
 */
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
