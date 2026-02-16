import type { FormPlugin } from '@moluoxixi/core'
import type { FormExportPluginAPI } from '@moluoxixi/plugin-export-core'
import type { ReactFormExportPluginOptions } from './types'
import { formExportPlugin } from '@moluoxixi/plugin-export-core'
import { browserDownload } from './browser'

export function reactFormExportPlugin(options: ReactFormExportPluginOptions = {}): FormPlugin<FormExportPluginAPI> {
  const { adapters, ...rest } = options
  return formExportPlugin({
    ...rest,
    adapters: {
      download: adapters?.download ?? browserDownload,
    },
  })
}
