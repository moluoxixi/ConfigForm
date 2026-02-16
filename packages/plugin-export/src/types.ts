import type { FormPlugin } from '@moluoxixi/core'

export interface FormExportDownloadPayload {
  filename: string
  mimeType: string
  content: string
}

export interface FormExportAdapters {
  download?: (payload: FormExportDownloadPayload) => void | Promise<void>
}

export interface FormExportDataOptions {
  excludePrefixes?: string[]
}

export interface FormExportPreviewOptions extends FormExportDataOptions {
  jsonSpace?: number
}

export interface FormExportJSONOptions extends FormExportDataOptions {
  space?: number
}

export interface FormExportDownloadJSONOptions extends FormExportJSONOptions {
  filename?: string
}

export interface FormExportPreview {
  data: Record<string, unknown>
  json: string
}

export interface FormExportPluginConfig {
  excludePrefixes?: string[]
  filenameBase?: string | (() => string)
  jsonSpace?: number
  adapters?: FormExportAdapters
}

export interface FormExportPluginAPI {
  getExportData: (options?: FormExportDataOptions) => Record<string, unknown>
  getExportPreview: (options?: FormExportPreviewOptions) => FormExportPreview
  subscribeExportPreview: (listener: (preview: FormExportPreview) => void, options?: FormExportPreviewOptions) => () => void
  exportJSON: (options?: FormExportJSONOptions) => string
  downloadJSON: (options?: FormExportDownloadJSONOptions) => Promise<void>
}

export type FormExportPlugin = FormPlugin<FormExportPluginAPI>
export type FormExportPluginOptions = FormExportPluginConfig

declare module '@moluoxixi/core' {
  interface FormInstance {
    getExportData?: FormExportPluginAPI['getExportData']
    getExportPreview?: FormExportPluginAPI['getExportPreview']
    subscribeExportPreview?: FormExportPluginAPI['subscribeExportPreview']
    exportJSON?: FormExportPluginAPI['exportJSON']
    downloadJSON?: FormExportPluginAPI['downloadJSON']
  }
}
