import type { FormPlugin } from '@moluoxixi/core'

export type ImportSetValueStrategy = 'merge' | 'shallow' | 'replace'

export interface FormImportOptions {
  strategy?: ImportSetValueStrategy
  allowInternal?: boolean
  excludePrefixes?: string[]
}

export interface FormImportJSONOptions extends FormImportOptions {
  reviver?: (this: unknown, key: string, value: unknown) => unknown
}

export interface FormImportResult {
  data: Record<string, unknown>
  appliedKeys: string[]
  skippedKeys: string[]
  strategy: ImportSetValueStrategy
  allowInternal: boolean
  excludePrefixes: string[]
}

export interface FormImportPluginConfig {
  excludePrefixes?: string[]
}

export interface FormImportPluginAPI {
  parseImportJSON: (input: string | Record<string, unknown>, options?: FormImportJSONOptions) => FormImportResult
  applyImport: (data: Record<string, unknown>, options?: FormImportOptions) => FormImportResult
  importJSON: (input: string | Record<string, unknown>, options?: FormImportJSONOptions) => FormImportResult
  parseImportJSONFile: (file: File, options?: FormImportJSONOptions) => Promise<FormImportResult>
  importJSONFile: (file: File, options?: FormImportJSONOptions) => Promise<FormImportResult>
}

export type FormImportPlugin = FormPlugin<FormImportPluginAPI>
export type FormImportPluginOptions = FormImportPluginConfig

declare module '@moluoxixi/core' {
  interface FormInstance {
    parseImportJSON?: FormImportPluginAPI['parseImportJSON']
    applyImport?: FormImportPluginAPI['applyImport']
    importJSON?: FormImportPluginAPI['importJSON']
    parseImportJSONFile?: FormImportPluginAPI['parseImportJSONFile']
    importJSONFile?: FormImportPluginAPI['importJSONFile']
  }
}
