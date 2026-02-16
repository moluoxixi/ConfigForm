import type { FormPrintPayload } from '@moluoxixi/plugin-print-core'
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

function assertBrowserAPI(name: string, target: unknown): void {
  if (!target) {
    throw new Error(`[plugin-print-react] ${name} is not available in current environment.`)
  }
}

function isElement(value: unknown): value is Element {
  return typeof Element !== 'undefined' && value instanceof Element
}

function escapeHtml(input: string): string {
  return input
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll('\'', '&#39;')
}

function resolveTargetElement(payload: FormPrintPayload): Element | null {
  if (typeof payload.target === 'string') {
    const node = document.querySelector(payload.target)
    if (!node) {
      throw new Error(`[plugin-print-react] Print target not found: ${payload.target}`)
    }
    return node
  }

  if (isElement(payload.target)) {
    return payload.target
  }

  return document.querySelector(DEFAULT_PRINT_SELECTOR)
}

function renderFallbackHtml(payload: FormPrintPayload): string {
  return `<section>
    <h1 style="margin:0 0 12px;font-size:20px;">${escapeHtml(payload.title || 'ConfigForm Print Preview')}</h1>
    <p style="margin:0 0 10px;color:#475569;font-size:12px;">打印时间：${escapeHtml(new Date().toLocaleString())}</p>
    <pre style="margin:0;padding:12px;border:1px solid #cbd5e1;border-radius:8px;background:#f8fafc;white-space:pre-wrap;word-break:break-word;">${escapeHtml(payload.json)}</pre>
  </section>`
}

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
