import { formIOPlugin } from '@moluoxixi/plugin-io-core'
import { browserDownload, browserPrint } from './browser'
import type { FormPlugin } from '@moluoxixi/core'
import type { FormIOPluginAPI } from '@moluoxixi/plugin-io-core'
import type { VueFormIOPluginOptions } from './types'

export function vueFormIOPlugin(options: VueFormIOPluginOptions = {}): FormPlugin<FormIOPluginAPI> {
  const { adapters, ...rest } = options
  return formIOPlugin({
    ...rest,
    adapters: {
      download: adapters?.download ?? browserDownload,
      print: adapters?.print ?? browserPrint,
    },
  })
}
