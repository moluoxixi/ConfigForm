import type { FieldPattern, FormInstance } from '@moluoxixi/core'

export type IOSetValueStrategy = 'merge' | 'shallow' | 'replace'

export interface FormIODownloadPayload {
  filename: string
  mimeType: string
  content: string
}

export interface FormIOPrintPayload {
  title?: string
  values: Record<string, unknown>
  json: string
  text: string
  form: FormInstance
}

export interface FormIOAdapters {
  download?: (payload: FormIODownloadPayload) => void | Promise<void>
  print?: (payload: FormIOPrintPayload) => void | Promise<void>
}

export interface FormIOExportDataOptions {
  excludePrefixes?: string[]
}

export interface FormIOExportPreviewOptions extends FormIOExportDataOptions {
  jsonSpace?: number
  csvDelimiter?: string
  csvLineBreak?: string
}

export interface FormIOExportJSONOptions extends FormIOExportDataOptions {
  space?: number
}

export interface FormIOExportCSVOptions extends FormIOExportDataOptions {
  delimiter?: string
  lineBreak?: string
}

export interface FormIOImportOptions {
  strategy?: IOSetValueStrategy
  allowInternal?: boolean
  excludePrefixes?: string[]
}

export interface FormIOImportJSONOptions extends FormIOImportOptions {
  reviver?: (this: unknown, key: string, value: unknown) => unknown
}

export interface FormIOImportCSVOptions extends FormIOImportOptions {
  delimiter?: string
  rowIndex?: number
  parseValue?: (raw: string, key: string) => unknown
}

export interface FormIODownloadJSONOptions extends FormIOExportJSONOptions {
  filename?: string
}

export interface FormIODownloadCSVOptions extends FormIOExportCSVOptions {
  filename?: string
}

export interface FormIOPrintOptions extends FormIOExportDataOptions {
  title?: string
  switchPattern?: boolean
  restorePattern?: boolean
  previewPattern?: FieldPattern
  formatText?: (values: Record<string, unknown>) => string
}

export interface FormIOImportResult {
  data: Record<string, unknown>
  appliedKeys: string[]
  skippedKeys: string[]
  strategy: IOSetValueStrategy
  allowInternal: boolean
  excludePrefixes: string[]
}

export interface FormIOPluginConfig {
  excludePrefixes?: string[]
  filenameBase?: string | (() => string)
  jsonSpace?: number
  csvDelimiter?: string
  csvLineBreak?: string
  adapters?: FormIOAdapters
  print?: {
    title?: string
    switchPattern?: boolean
    restorePattern?: boolean
    previewPattern?: FieldPattern
    formatText?: (values: Record<string, unknown>) => string
  }
}

export interface FormIOExportPreview {
  data: Record<string, unknown>
  json: string
  csv: string
}

export interface FormIOPluginAPI {
  getExportData: (options?: FormIOExportDataOptions) => Record<string, unknown>
  getExportPreview: (options?: FormIOExportPreviewOptions) => FormIOExportPreview
  subscribeExportPreview: (listener: (preview: FormIOExportPreview) => void, options?: FormIOExportPreviewOptions) => () => void
  exportJSON: (options?: FormIOExportJSONOptions) => string
  exportCSV: (options?: FormIOExportCSVOptions) => string
  downloadJSON: (options?: FormIODownloadJSONOptions) => Promise<void>
  downloadCSV: (options?: FormIODownloadCSVOptions) => Promise<void>
  parseImportJSON: (input: string | Record<string, unknown>, options?: FormIOImportJSONOptions) => FormIOImportResult
  parseImportCSV: (input: string, options?: FormIOImportCSVOptions) => FormIOImportResult
  applyImport: (data: Record<string, unknown>, options?: FormIOImportOptions) => FormIOImportResult
  importJSON: (input: string | Record<string, unknown>, options?: FormIOImportJSONOptions) => FormIOImportResult
  importCSV: (input: string, options?: FormIOImportCSVOptions) => FormIOImportResult
  print: (options?: FormIOPrintOptions) => Promise<void>
}
