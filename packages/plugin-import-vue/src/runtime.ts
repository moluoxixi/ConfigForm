import type { FormPlugin } from '@moluoxixi/core'
import type { FormImportPluginAPI } from '@moluoxixi/plugin-import-core'
import type { VueFormImportPluginOptions, VueFormImportRuntime } from './types'
import { readFileAsText } from './browser'
import { vueFormImportPlugin } from './plugin'

function requireApi(api: FormImportPluginAPI | undefined): FormImportPluginAPI {
  if (!api) {
    throw new Error('[plugin-import-vue] Runtime API is not ready. Mount ConfigForm with runtime.plugin first.')
  }
  return api
}

export function createVueFormImportRuntime(options: VueFormImportPluginOptions = {}): VueFormImportRuntime {
  const rawPlugin = vueFormImportPlugin(options)
  let pluginApi: FormImportPluginAPI | undefined

  const plugin: FormPlugin<FormImportPluginAPI> = {
    name: rawPlugin.name,
    install(form, context) {
      const installed = rawPlugin.install(form, context)
      pluginApi = installed.api

      return {
        api: installed.api,
        dispose: () => {
          if (pluginApi === installed.api) {
            pluginApi = undefined
          }
          installed.dispose?.()
        },
      }
    },
  }

  return {
    plugin,
    getAPI: () => pluginApi,
    parseImportJSON: (input, importOptions) => requireApi(pluginApi).parseImportJSON(input, importOptions),
    parseImportCSV: (input, importOptions) => requireApi(pluginApi).parseImportCSV(input, importOptions),
    applyImport: (data, importOptions) => requireApi(pluginApi).applyImport(data, importOptions),
    importJSON: (input, importOptions) => requireApi(pluginApi).importJSON(input, importOptions),
    importCSV: (input, importOptions) => requireApi(pluginApi).importCSV(input, importOptions),
    parseImportJSONFile: async (file, importOptions) => {
      const content = await readFileAsText(file)
      return requireApi(pluginApi).parseImportJSON(content, importOptions)
    },
    parseImportCSVFile: async (file, importOptions) => {
      const content = await readFileAsText(file)
      return requireApi(pluginApi).parseImportCSV(content, importOptions)
    },
    importJSONFile: async (file, importOptions) => {
      const content = await readFileAsText(file)
      return requireApi(pluginApi).importJSON(content, importOptions)
    },
    importCSVFile: async (file, importOptions) => {
      const content = await readFileAsText(file)
      return requireApi(pluginApi).importCSV(content, importOptions)
    },
  }
}
