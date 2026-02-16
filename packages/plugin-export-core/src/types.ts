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
  csvDelimiter?: string
  csvLineBreak?: string
}

export interface FormExportJSONOptions extends FormExportDataOptions {
  space?: number
}

export interface FormExportCSVOptions extends FormExportDataOptions {
  delimiter?: string
  lineBreak?: string
}

export interface FormExportDownloadJSONOptions extends FormExportJSONOptions {
  filename?: string
}

export interface FormExportDownloadCSVOptions extends FormExportCSVOptions {
  filename?: string
}

export interface FormExportPreview {
  data: Record<string, unknown>
  json: string
  csv: string
}

export interface FormExportPluginConfig {
  excludePrefixes?: string[]
  filenameBase?: string | (() => string)
  jsonSpace?: number
  csvDelimiter?: string
  csvLineBreak?: string
  adapters?: FormExportAdapters
}

export interface FormExportPluginAPI {
  getExportData: (options?: FormExportDataOptions) => Record<string, unknown>
  getExportPreview: (options?: FormExportPreviewOptions) => FormExportPreview
  subscribeExportPreview: (listener: (preview: FormExportPreview) => void, options?: FormExportPreviewOptions) => () => void
  exportJSON: (options?: FormExportJSONOptions) => string
  exportCSV: (options?: FormExportCSVOptions) => string
  downloadJSON: (options?: FormExportDownloadJSONOptions) => Promise<void>
  downloadCSV: (options?: FormExportDownloadCSVOptions) => Promise<void>
}

export type FormExportPlugin = FormPlugin<FormExportPluginAPI>
