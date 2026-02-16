import type { FormPlugin } from '@moluoxixi/core'
import type {
  FormExportAdapters,
  FormExportDownloadCSVOptions,
  FormExportDownloadJSONOptions,
  FormExportPluginAPI,
  FormExportPluginConfig,
  FormExportPreview,
  FormExportPreviewOptions,
} from '@moluoxixi/plugin-export-core'

export interface ReactFormExportPluginOptions extends Omit<FormExportPluginConfig, 'adapters'> {
  adapters?: FormExportAdapters
}

export interface ReactFormExportRuntime {
  plugin: FormPlugin<FormExportPluginAPI>
  getAPI: () => FormExportPluginAPI | undefined
  getExportPreview: (options?: FormExportPreviewOptions) => FormExportPreview
  subscribeExportPreview: (listener: (preview: FormExportPreview) => void, options?: FormExportPreviewOptions) => () => void
  exportJSON: (options?: FormExportDownloadJSONOptions) => string
  exportCSV: (options?: FormExportDownloadCSVOptions) => string
  downloadJSON: (options?: FormExportDownloadJSONOptions) => Promise<void>
  downloadCSV: (options?: FormExportDownloadCSVOptions) => Promise<void>
}
