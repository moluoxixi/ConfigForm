import type { FieldPattern, FormInstance, FormPlugin } from '@moluoxixi/core'

export type FormPrintTargetResolver = () => string | Element | null | undefined
export type FormPrintTarget = string | Element | FormPrintTargetResolver

export interface FormPrintPayload {
  title?: string
  values: Record<string, unknown>
  json: string
  text: string
  form: FormInstance
  target?: string | Element
}

export interface FormPrintAdapters {
  print?: (payload: FormPrintPayload) => void | Promise<void>
}

export interface FormPrintOptions {
  excludePrefixes?: string[]
  title?: string
  target?: FormPrintTarget
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
    target?: FormPrintTarget
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

declare module '@moluoxixi/core' {
  interface FormInstance {
    print?: FormPrintPluginAPI['print']
  }
}
