import type { FormPlugin } from '@moluoxixi/core'
import type { FormPrintPluginAPI } from '@moluoxixi/plugin-print-core'
import type { VueFormPrintPluginOptions } from './types'
import { formPrintPlugin } from '@moluoxixi/plugin-print-core'
import { browserPrint } from './browser'

export function vueFormPrintPlugin(options: VueFormPrintPluginOptions = {}): FormPlugin<FormPrintPluginAPI> {
  const { adapters, ...rest } = options
  return formPrintPlugin({
    ...rest,
    adapters: {
      print: adapters?.print ?? browserPrint,
    },
  })
}
