import type { FormPrintPayload } from './types'
import printJS from 'print-js'

/**
 * ensureElementId：执行当前功能逻辑。
 *
 * @param target 参数 target 的输入说明。
 *
 * @returns 返回当前功能的处理结果。
 */
function ensureElementId(target: Element): { id: string, cleanup: () => void } {
  const id = target.id
  if (id) {
    return { id,
      /**
       * cleanup：执行当前功能逻辑。
       */
      cleanup: () => {} }
  }

  const generatedId = `configform-print-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  target.id = generatedId
  return {
    id: generatedId,
    /**
     * cleanup：执行当前功能逻辑。
     */

    cleanup: () => {
      if (target.id === generatedId) {
        target.removeAttribute('id')
      }
    },
  }
}

/**
 * browser Print：当前功能模块的核心执行单元。
 * 所属模块：`packages/plugin-print/src/browser.ts`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param payload 参数 `payload`用于提供当前函数执行所需的输入信息。
 */
export async function browserPrint(payload: FormPrintPayload): Promise<void> {
  assertBrowserAPI('window', typeof window !== 'undefined' ? window : undefined)
  assertBrowserAPI('document', typeof document !== 'undefined' ? document : undefined)

  const target = resolveTargetElement(payload)
  const title = payload.title || 'ConfigForm Print Preview'
  const styles = collectDocumentPrintStyles()
  const style = `${PRINT_STYLE}\n${styles.inlineStyleText}`

  if (target) {
    const { id, cleanup } = ensureElementId(target)
    try {
      printJS({
        printable: id,
        type: 'html',
        scanStyles: true,
        targetStyles: ['*'],
        css: styles.cssLinks,
        style,
        documentTitle: title,
      })
    }
    finally {
      setTimeout(cleanup, 0)
    }
    return
  }

  const printable = renderFallbackHtml(payload)

  printJS({
    printable,
    type: 'raw-html',
    scanStyles: true,
    targetStyles: ['*'],
    css: styles.cssLinks,
    style,
    documentTitle: title,
  })
}
