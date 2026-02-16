import type { FormPlugin } from '@moluoxixi/core'
import type { FormExportPluginAPI } from '@moluoxixi/plugin-export-core'
import type { VueFormExportPluginOptions } from './types'
import { formExportPlugin } from '@moluoxixi/plugin-export-core'
import { browserDownload } from './browser'

export function vueFormExportPlugin(options: VueFormExportPluginOptions = {}): FormPlugin<FormExportPluginAPI> {
  const { adapters, ...rest } = options
  return formExportPlugin({
    ...rest,
    adapters: {
      download: adapters?.download ?? browserDownload,
    },
  })
}
