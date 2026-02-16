import type { FormPlugin } from '@moluoxixi/core'
import type { FormPrintAdapters, FormPrintOptions, FormPrintPluginAPI, FormPrintPluginConfig } from '@moluoxixi/plugin-print-core'

export interface VueFormPrintPluginOptions extends Omit<FormPrintPluginConfig, 'adapters'> {
  adapters?: FormPrintAdapters
}

export interface VueFormPrintRuntime {
  plugin: FormPlugin<FormPrintPluginAPI>
  getAPI: () => FormPrintPluginAPI | undefined
  print: (options?: FormPrintOptions) => Promise<void>
}
