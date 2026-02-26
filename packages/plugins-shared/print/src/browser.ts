import type { FormPrintPayload } from './types'

interface PrintJSOptions {
  printable: string
  type: 'html' | 'raw-html'
  scanStyles?: boolean
  targetStyles?: string[]
  css?: string[]
  style?: string
  documentTitle?: string
}

type PrintJSFn = (options: PrintJSOptions) => void

interface DocumentPrintStyles {
  cssLinks: string[]
  inlineStyleText: string
}

const PRINT_STYLE = `
.configform-print {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
  line-height: 1.5;
}
.configform-print h1,
.configform-print h2 {
  margin: 0 0 12px 0;
}
.configform-print section + section {
  margin-top: 16px;
}
.configform-print pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}
`

function assertBrowserAPI(apiName: 'window' | 'document', value: unknown): void {
  if (!value) {
    throw new Error(`[ConfigForm][print] browserPrint requires browser "${apiName}" API.`)
  }
}

async function resolvePrintJS(): Promise<PrintJSFn> {
  const mod = await import('print-js')
  const candidate = (mod as { default?: unknown }).default ?? mod
  if (typeof candidate !== 'function') {
    throw new TypeError('[ConfigForm][print] Failed to load print-js runtime.')
  }
  return candidate as PrintJSFn
}

function ensureElementId(target: Element): { id: string, cleanup: () => void } {
  if (target.id) {
    return { id: target.id, cleanup: () => {} }
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

function resolveTargetElement(payload: FormPrintPayload): Element | null {
  const { target } = payload
  if (!target) {
    return null
  }
  if (typeof target === 'string') {
    return document.querySelector(target)
  }
  return target
}

function collectDocumentPrintStyles(): DocumentPrintStyles {
  const cssLinks = Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'))
    .map(link => link.href)
    .filter(Boolean)

  const inlineStyleText = Array.from(document.querySelectorAll<HTMLStyleElement>('style'))
    .map(style => style.textContent ?? '')
    .filter(Boolean)
    .join('\n')

  return { cssLinks, inlineStyleText }
}

function escapeHtml(content: string): string {
  return content
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll('\'', '&#39;')
}

function renderFallbackHtml(payload: FormPrintPayload): string {
  const title = payload.title ?? document.title ?? 'ConfigForm Print Preview'
  return `
<div class="configform-print">
  <h1>${escapeHtml(title)}</h1>
  <section>
    <h2>JSON</h2>
    <pre>${escapeHtml(payload.json)}</pre>
  </section>
  <section>
    <h2>Text</h2>
    <pre>${escapeHtml(payload.text)}</pre>
  </section>
</div>
`.trim()
}

export async function browserPrint(payload: FormPrintPayload): Promise<void> {
  assertBrowserAPI('window', typeof window !== 'undefined' ? window : undefined)
  assertBrowserAPI('document', typeof document !== 'undefined' ? document : undefined)

  const printJS = await resolvePrintJS()
  const target = resolveTargetElement(payload)
  const title = payload.title ?? document.title ?? 'ConfigForm Print Preview'
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

  printJS({
    printable: renderFallbackHtml(payload),
    type: 'raw-html',
    scanStyles: true,
    targetStyles: ['*'],
    css: styles.cssLinks,
    style,
    documentTitle: title,
  })
}
