import type { FormPlugin } from '@moluoxixi/core'
import type { FormExportPluginAPI, FormExportPreview, FormExportPreviewOptions } from '@moluoxixi/plugin-export-core'
import type { ReactFormExportPluginOptions, ReactFormExportRuntime } from './types'
import { reactFormExportPlugin } from './plugin'

interface ExportPreviewSubscription {
  listener: (preview: FormExportPreview) => void
  options?: FormExportPreviewOptions
  dispose?: () => void
}

function requireApi(api: FormExportPluginAPI | undefined): FormExportPluginAPI {
  if (!api) {
    throw new Error('[plugin-export-react] Runtime API is not ready. Mount ConfigForm with runtime.plugin first.')
  }
  return api
}

function bindSubscription(api: FormExportPluginAPI | undefined, subscription: ExportPreviewSubscription): void {
  subscription.dispose?.()
  subscription.dispose = undefined
  if (!api) {
    return
  }
  subscription.dispose = api.subscribeExportPreview(subscription.listener, subscription.options)
}

export function createReactFormExportRuntime(options: ReactFormExportPluginOptions = {}): ReactFormExportRuntime {
  const rawPlugin = reactFormExportPlugin(options)
  let pluginApi: FormExportPluginAPI | undefined
  const subscriptions = new Set<ExportPreviewSubscription>()

  const plugin: FormPlugin<FormExportPluginAPI> = {
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
    getExportPreview: exportOptions => requireApi(pluginApi).getExportPreview(exportOptions),
    subscribeExportPreview: (listener, exportOptions) => {
      const subscription: ExportPreviewSubscription = { listener, options: exportOptions }
      subscriptions.add(subscription)
      bindSubscription(pluginApi, subscription)
      return () => {
        subscription.dispose?.()
        subscriptions.delete(subscription)
      }
    },
    exportJSON: exportOptions => requireApi(pluginApi).exportJSON(exportOptions),
    exportCSV: exportOptions => requireApi(pluginApi).exportCSV(exportOptions),
    downloadJSON: exportOptions => requireApi(pluginApi).downloadJSON(exportOptions),
    downloadCSV: exportOptions => requireApi(pluginApi).downloadCSV(exportOptions),
  }
}
