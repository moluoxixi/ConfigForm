import { reactFormIOPlugin } from './plugin'
import { readFileAsText } from './browser'
import type { FormPlugin } from '@moluoxixi/core'
import type { FormIOExportPreview, FormIOExportPreviewOptions, FormIOPluginAPI } from '@moluoxixi/plugin-io-core'
import type { ReactFormIOPluginOptions, ReactFormIORuntime } from './types'

interface ExportPreviewSubscription {
  listener: (preview: FormIOExportPreview) => void
  options?: FormIOExportPreviewOptions
  dispose?: () => void
}

function requireApi(api: FormIOPluginAPI | undefined): FormIOPluginAPI {
  if (!api) {
    throw new Error('[plugin-io-react] Runtime API is not ready. Mount ConfigForm with runtime.plugin first.')
  }
  return api
}

function bindSubscription(
  api: FormIOPluginAPI | undefined,
  subscription: ExportPreviewSubscription,
): void {
  subscription.dispose?.()
  subscription.dispose = undefined
  if (!api) {
    return
  }
  subscription.dispose = api.subscribeExportPreview(subscription.listener, subscription.options)
}

export function createReactFormIORuntime(options: ReactFormIOPluginOptions = {}): ReactFormIORuntime {
  const rawPlugin = reactFormIOPlugin(options)
  let pluginApi: FormIOPluginAPI | undefined
  const subscriptions = new Set<ExportPreviewSubscription>()

  const plugin: FormPlugin<FormIOPluginAPI> = {
    name: rawPlugin.name,
    install(form, context) {
      const installed = rawPlugin.install(form, context)
      pluginApi = installed.api

      Promise.resolve().then(() => {
        if (pluginApi !== installed.api) {
          return
        }
        for (const subscription of subscriptions) {
          bindSubscription(pluginApi, subscription)
        }
      })

      return {
        api: installed.api,
        dispose: () => {
          if (pluginApi === installed.api) {
            pluginApi = undefined
          }
          for (const subscription of subscriptions) {
            bindSubscription(undefined, subscription)
          }
          installed.dispose?.()
        },
      }
    },
  }

  return {
    plugin,
    getAPI: () => pluginApi,
    getExportPreview: options => requireApi(pluginApi).getExportPreview(options),
    subscribeExportPreview: (listener, previewOptions) => {
      const subscription: ExportPreviewSubscription = { listener, options: previewOptions }
      subscriptions.add(subscription)
      bindSubscription(pluginApi, subscription)
      return () => {
        subscription.dispose?.()
        subscriptions.delete(subscription)
      }
    },
    exportJSON: options => requireApi(pluginApi).exportJSON(options),
    exportCSV: options => requireApi(pluginApi).exportCSV(options),
    downloadJSON: options => requireApi(pluginApi).downloadJSON(options),
    downloadCSV: options => requireApi(pluginApi).downloadCSV(options),
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
    print: printOptions => requireApi(pluginApi).print(printOptions),
  }
}
