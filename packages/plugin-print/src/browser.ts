import type { FormPrintPayload } from './types'
import printJS from 'print-js'

const DEFAULT_PRINT_SELECTOR = '[data-configform-print-root="true"]'
const PRINT_STYLE = `
  @page { margin: 12mm; }
  body {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
`

interface DocumentPrintStyles {
  cssLinks: string[]
  inlineStyleText: string
}

/**
 * assert Browser API：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 assert Browser API 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
function assertBrowserAPI(name: string, target: unknown): void {
  if (!target) {
    throw new Error(`[plugin-print] ${name} is not available in current environment.`)
  }
}

/**
 * is Element：负责“判断is Element”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 is Element 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
function isElement(value: unknown): value is Element {
  return typeof Element !== 'undefined' && value instanceof Element
}

/**
 * escape Html：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 escape Html 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
function escapeHtml(input: string): string {
  return input
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll('\'', '&#39;')
}

/**
 * resolve Target Element：负责“解析resolve Target Element”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 resolve Target Element 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
function resolveTargetElement(payload: FormPrintPayload): Element | null {
  if (typeof payload.target === 'string') {
    const node = document.querySelector(payload.target)
    if (!node) {
      throw new Error(`[plugin-print] Print target not found: ${payload.target}`)
    }
    return node
  }

  if (isElement(payload.target)) {
    return payload.target
  }

  return document.querySelector(DEFAULT_PRINT_SELECTOR)
}

/**
 * render Fallback Html：负责“渲染render Fallback Html”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 render Fallback Html 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
function renderFallbackHtml(payload: FormPrintPayload): string {
  return `<section>
    <h1 style="margin:0 0 12px;font-size:20px;">${escapeHtml(payload.title || 'ConfigForm Print Preview')}</h1>
    <p style="margin:0 0 10px;color:#475569;font-size:12px;">打印时间：${escapeHtml(new Date().toLocaleString())}</p>
    <pre style="margin:0;padding:12px;border:1px solid #cbd5e1;border-radius:8px;background:#f8fafc;white-space:pre-wrap;word-break:break-word;">${escapeHtml(payload.json)}</pre>
  </section>`
}

/**
 * collect Document Print Styles：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 collect Document Print Styles 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
function collectDocumentPrintStyles(): DocumentPrintStyles {
  const styleNodes = Array.from(document.querySelectorAll('style'))
  const inlineStyleText = styleNodes
    .map(node => node.textContent ?? '')
    .filter(Boolean)
    .join('\n')

  const cssLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"][href]'))
    .map((node) => {
      if (node instanceof HTMLLinkElement) {
        return node.href
      }
      return ''
    })
    .filter(Boolean)

  return {
    cssLinks,
    inlineStyleText,
  }
}

/**
 * ensure Element Id：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 ensure Element Id 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
function ensureElementId(target: Element): { id: string, cleanup: () => void } {
  const id = target.id
  if (id) {
    return { id, cleanup: () => {} }
  }

  const generatedId = `configform-print-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  target.id = generatedId
  return {
    id: generatedId,
    cleanup: () => {
      if (target.id === generatedId) {
        target.removeAttribute('id')
      }
    },
  }
}

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
