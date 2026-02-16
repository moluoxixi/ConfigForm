import type { FormExportDownloadPayload } from '@moluoxixi/plugin-export-core'

function assertBrowserAPI(name: string, target: unknown): void {
  if (!target) {
    throw new Error(`[plugin-export-react] ${name} is not available in current environment.`)
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
