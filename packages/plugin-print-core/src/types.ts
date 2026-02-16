import type { FieldPattern, FormInstance, FormPlugin } from '@moluoxixi/core'

export interface FormPrintPayload {
  title?: string
  values: Record<string, unknown>
  json: string
  text: string
  form: FormInstance
}

export interface FormPrintAdapters {
  print?: (payload: FormPrintPayload) => void | Promise<void>
}

export interface FormPrintOptions {
  excludePrefixes?: string[]
  title?: string
  switchPattern?: boolean
  restorePattern?: boolean
  previewPattern?: FieldPattern
  formatText?: (values: Record<string, unknown>) => string
}

export interface FormPrintPluginConfig {
  excludePrefixes?: string[]
  jsonSpace?: number
  adapters?: FormPrintAdapters
  print?: {
    title?: string
    switchPattern?: boolean
    restorePattern?: boolean
    previewPattern?: FieldPattern
    formatText?: (values: Record<string, unknown>) => string
  }
}

export interface FormPrintPluginAPI {
  print: (options?: FormPrintOptions) => Promise<void>
}
export type FormPrintPlugin = FormPlugin<FormPrintPluginAPI>
