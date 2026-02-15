import type { FormInstance, FormPlugin } from '@moluoxixi/core'
import type { I18nPluginAPI, I18nPluginConfig } from './types'
import { translateSchema } from './schema-i18n'

/**
 * i18n 插件（框架无关）
 *
 * 将外部 i18n 库注入表单：
 * - 由插件提供 schema 翻译能力
 * - 通过 version/subscribe 驱动框架层重渲染
 * - 提供 translateSchema / setLocale 等 API
 */
export function i18nPlugin(config: I18nPluginConfig): FormPlugin<I18nPluginAPI> {
  const {
    locale: initialLocale,
    changeLocale,
    onLocaleChange,
    t,
    prefix,
    translatableProps,
    translateEnumLabels,
  } = config

  const schemaConfig = {
    t,
    prefix,
    translatableProps,
    translateEnumLabels,
  }

  return {
    name: 'i18n',

    install(form: FormInstance) {
      let currentLocale = initialLocale
      let version = 0
      const listeners = new Set<(nextVersion: number) => void>()

      const refresh = (): void => {
        version += 1
        for (const listener of listeners) {
          listener(version)
        }
      }

      const setLocale = async (next: string): Promise<void> => {
        if (next === currentLocale)
          return
        currentLocale = next
        if (changeLocale) {
          await changeLocale(next)
        }
        refresh()
      }

      const disposeLocale = onLocaleChange
        ? onLocaleChange((next) => {
          currentLocale = next
          refresh()
        })
        : undefined

      const subscribe = (listener: (nextVersion: number) => void): (() => void) => {
        listeners.add(listener)
        return () => {
          listeners.delete(listener)
        }
      }

      const api: I18nPluginAPI = {
        t,
        get version() {
          return version
        },
        subscribe,
        getLocale: () => currentLocale,
        setLocale,
        refresh,
        translateSchema: schema => translateSchema(schema, schemaConfig),
      }

      return {
        api,
        dispose() {
          disposeLocale?.()
          listeners.clear()
        },
      }
    },
  }
}
