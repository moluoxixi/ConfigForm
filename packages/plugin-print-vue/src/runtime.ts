import type { FormPlugin } from '@moluoxixi/core'
import type { FormPrintPluginAPI } from '@moluoxixi/plugin-print-core'
import type { VueFormPrintPluginOptions, VueFormPrintRuntime } from './types'
import { vueFormPrintPlugin } from './plugin'

function requireApi(api: FormPrintPluginAPI | undefined): FormPrintPluginAPI {
  if (!api) {
    throw new Error('[plugin-print-vue] Runtime API is not ready. Mount ConfigForm with runtime.plugin first.')
  }
  return api
}

export function createVueFormPrintRuntime(options: VueFormPrintPluginOptions = {}): VueFormPrintRuntime {
  const rawPlugin = vueFormPrintPlugin(options)
  let pluginApi: FormPrintPluginAPI | undefined

  const plugin: FormPlugin<FormPrintPluginAPI> = {
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
    print: printOptions => requireApi(pluginApi).print(printOptions),
  }
}
