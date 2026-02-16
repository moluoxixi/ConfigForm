import type { FormPlugin } from '@moluoxixi/core'
import type { FormImportPluginAPI } from '@moluoxixi/plugin-import-core'
import type { VueFormImportPluginOptions } from './types'
import { formImportPlugin } from '@moluoxixi/plugin-import-core'

export function vueFormImportPlugin(options: VueFormImportPluginOptions = {}): FormPlugin<FormImportPluginAPI> {
  return formImportPlugin(options)
}
