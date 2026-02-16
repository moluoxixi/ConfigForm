import type { FormPrintAdapters, FormPrintPluginConfig } from '@moluoxixi/plugin-print-core'

export interface PrintPluginOptions extends Omit<FormPrintPluginConfig, 'adapters'> {
  adapters?: FormPrintAdapters
}
