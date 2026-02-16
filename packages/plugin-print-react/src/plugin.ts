import type { FormPrintPlugin, FormPrintPluginConfig } from '@moluoxixi/plugin-print-core'
import type { PrintPluginOptions } from './types'
import { printPlugin as corePrintPlugin } from '@moluoxixi/plugin-print-core'
import { browserPrint } from './browser'

export function printPlugin(options: PrintPluginOptions = {}): FormPrintPlugin {
  const { adapters, ...rest } = options
  return corePrintPlugin({
    ...rest,
    adapters: {
      print: adapters?.print ?? browserPrint,
    },
  } satisfies FormPrintPluginConfig)
}
