import type { FormPrintPayload } from '@moluoxixi/plugin-print-core'

function assertBrowserAPI(name: string, target: unknown): void {
  if (!target) {
    throw new Error(`[plugin-print-react] ${name} is not available in current environment.`)
  }
}

function escapeHtml(input: string): string {
  return input
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll('\'', '&#39;')
}

function renderPrintHtml(payload: FormPrintPayload): string {
  const title = payload.title || 'ConfigForm Print Preview'
  const rows = Object.entries(payload.values)
    .map(([key, value]) => {
      const display = typeof value === 'string' ? value : JSON.stringify(value)
      return `<tr><th>${escapeHtml(key)}</th><td>${escapeHtml(display)}</td></tr>`
    })
    .join('')

  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 24px; color: #1f2329; }
    h1 { margin: 0 0 12px; font-size: 20px; }
    p { margin: 0 0 16px; color: #57606a; font-size: 13px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    th, td { border: 1px solid #d0d7de; padding: 8px 10px; text-align: left; vertical-align: top; }
    th { width: 180px; background: #f6f8fa; font-weight: 600; }
    pre { margin: 0; background: #f6f8fa; border: 1px solid #d0d7de; padding: 12px; border-radius: 6px; white-space: pre-wrap; word-break: break-word; }
  </style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <p>打印时间：${escapeHtml(new Date().toLocaleString())}</p>
  <table><tbody>${rows}</tbody></table>
  <h2 style="font-size: 16px; margin: 0 0 8px;">JSON</h2>
  <pre>${escapeHtml(payload.json)}</pre>
</body>
</html>`
}

export async function browserPrint(payload: FormPrintPayload): Promise<void> {
  assertBrowserAPI('window.open', typeof window !== 'undefined' ? window.open : undefined)
  const printWindow = window.open('', '_blank', 'noopener,noreferrer,width=980,height=720')
  if (!printWindow) {
    throw new Error('[plugin-print-react] Failed to open print window. Please allow popups and try again.')
  }

  const html = renderPrintHtml(payload)
  printWindow.document.open()
  printWindow.document.write(html)
  printWindow.document.close()

  await new Promise<void>((resolve) => {
    let completed = false
    let invoked = false
    const done = (): void => {
      if (completed) {
        return
      }
      completed = true
      resolve()
    }
    const invokePrint = (): void => {
      if (invoked) {
        return
      }
      invoked = true
      try {
        printWindow.focus()
        printWindow.print()
      }
      finally {
        setTimeout(() => {
          printWindow.close()
          done()
        }, 120)
      }
    }
    printWindow.addEventListener('load', invokePrint, { once: true })
    setTimeout(invokePrint, 250)
  })
}
