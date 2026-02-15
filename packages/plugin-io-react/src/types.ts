import type { FormPlugin } from '@moluoxixi/core'
import type {
  FormIOAdapters,
  FormIODownloadCSVOptions,
  FormIODownloadJSONOptions,
  FormIOExportPreview,
  FormIOExportPreviewOptions,
  FormIOImportCSVOptions,
  FormIOImportJSONOptions,
  FormIOImportResult,
  FormIOImportOptions,
  FormIOPluginAPI,
  FormIOPluginConfig,
  FormIOPrintOptions,
} from '@moluoxixi/plugin-io-core'

export interface ReactFormIOPluginOptions extends Omit<FormIOPluginConfig, 'adapters'> {
  adapters?: Partial<FormIOAdapters>
}

export interface ReactFormIORuntime {
  plugin: FormPlugin<FormIOPluginAPI>
  getAPI: () => FormIOPluginAPI | undefined
  getExportPreview: (options?: FormIOExportPreviewOptions) => FormIOExportPreview
  subscribeExportPreview: (listener: (preview: FormIOExportPreview) => void, options?: FormIOExportPreviewOptions) => () => void
  exportJSON: (options?: FormIODownloadJSONOptions) => string
  exportCSV: (options?: FormIODownloadCSVOptions) => string
  downloadJSON: (options?: FormIODownloadJSONOptions) => Promise<void>
  downloadCSV: (options?: FormIODownloadCSVOptions) => Promise<void>
  parseImportJSON: (input: string | Record<string, unknown>, options?: FormIOImportJSONOptions) => FormIOImportResult
  parseImportCSV: (input: string, options?: FormIOImportCSVOptions) => FormIOImportResult
  applyImport: (data: Record<string, unknown>, options?: FormIOImportOptions) => FormIOImportResult
  importJSON: (input: string | Record<string, unknown>, options?: FormIOImportJSONOptions) => FormIOImportResult
  importCSV: (input: string, options?: FormIOImportCSVOptions) => FormIOImportResult
  parseImportJSONFile: (file: File, options?: FormIOImportJSONOptions) => Promise<FormIOImportResult>
  parseImportCSVFile: (file: File, options?: FormIOImportCSVOptions) => Promise<FormIOImportResult>
  importJSONFile: (file: File, options?: FormIOImportJSONOptions) => Promise<FormIOImportResult>
  importCSVFile: (file: File, options?: FormIOImportCSVOptions) => Promise<FormIOImportResult>
  print: (options?: FormIOPrintOptions) => Promise<void>
}
