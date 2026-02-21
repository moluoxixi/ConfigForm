import type { FormExportDownloadPayload } from './types'

/**
 * assert Browser API：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 assert Browser API 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
function assertBrowserAPI(name: string, target: unknown): void {
  if (!target) {
    throw new Error(`[plugin-export] ${name} is not available in current environment.`)
  }
}

export async function browserDownload(payload: FormExportDownloadPayload): Promise<void> {
  assertBrowserAPI('window', typeof window !== 'undefined' ? window : undefined)
  const blob = new Blob([payload.content], { type: payload.mimeType })
  const href = URL.createObjectURL(blob)

  try {
    const link = document.createElement('a')
    link.href = href
    link.download = payload.filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  finally {
    URL.revokeObjectURL(href)
  }
}
