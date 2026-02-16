import type { FormPlugin } from '@moluoxixi/core'
import type { FormImportPluginAPI } from '@moluoxixi/plugin-import-core'
import type { ReactFormImportPluginOptions } from './types'
import { formImportPlugin } from '@moluoxixi/plugin-import-core'

export function reactFormImportPlugin(options: ReactFormImportPluginOptions = {}): FormPlugin<FormImportPluginAPI> {
  return formImportPlugin(options)
}
