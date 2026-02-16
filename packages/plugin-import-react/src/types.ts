import type { FormPlugin } from '@moluoxixi/core'
import type {
  FormImportCSVOptions,
  FormImportJSONOptions,
  FormImportOptions,
  FormImportPluginAPI,
  FormImportPluginConfig,
  FormImportResult,
} from '@moluoxixi/plugin-import-core'

export type ReactFormImportPluginOptions = FormImportPluginConfig

export interface ReactFormImportRuntime {
  plugin: FormPlugin<FormImportPluginAPI>
  getAPI: () => FormImportPluginAPI | undefined
  parseImportJSON: (input: string | Record<string, unknown>, options?: FormImportJSONOptions) => FormImportResult
  parseImportCSV: (input: string, options?: FormImportCSVOptions) => FormImportResult
  applyImport: (data: Record<string, unknown>, options?: FormImportOptions) => FormImportResult
  importJSON: (input: string | Record<string, unknown>, options?: FormImportJSONOptions) => FormImportResult
  importCSV: (input: string, options?: FormImportCSVOptions) => FormImportResult
  parseImportJSONFile: (file: File, options?: FormImportJSONOptions) => Promise<FormImportResult>
  parseImportCSVFile: (file: File, options?: FormImportCSVOptions) => Promise<FormImportResult>
  importJSONFile: (file: File, options?: FormImportJSONOptions) => Promise<FormImportResult>
  importCSVFile: (file: File, options?: FormImportCSVOptions) => Promise<FormImportResult>
}
