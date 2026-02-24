import type { FormExportDownloadPayload } from './types'

/**
 * assert Browser API：当前功能模块的核心执行单元。
 * 所属模块：`packages/plugin-export/src/browser.ts`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param name 参数 `name`用于提供当前函数执行所需的输入信息。
 * @param target 参数 `target`用于提供当前函数执行所需的输入信息。
 */
function assertBrowserAPI(name: string, target: unknown): void {
  if (!target) {
    throw new Error(`[plugin-export] ${name} is not available in current environment.`)
  }
}

/**
 * browser Download：当前功能模块的核心执行单元。
 * 所属模块：`packages/plugin-export/src/browser.ts`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param payload 参数 `payload`用于提供当前函数执行所需的输入信息。
 */
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
