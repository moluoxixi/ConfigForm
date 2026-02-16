import type { FormPlugin } from '@moluoxixi/core'
import type { FormPrintPluginAPI } from '@moluoxixi/plugin-print-core'
import type { ReactFormPrintPluginOptions } from './types'
import { formPrintPlugin } from '@moluoxixi/plugin-print-core'
import { browserPrint } from './browser'

export function reactFormPrintPlugin(options: ReactFormPrintPluginOptions = {}): FormPlugin<FormPrintPluginAPI> {
  const { adapters, ...rest } = options
  return formPrintPlugin({
    ...rest,
    adapters: {
      print: adapters?.print ?? browserPrint,
    },
  })
}
