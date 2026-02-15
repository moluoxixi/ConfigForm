import i18next from 'i18next'
import type { Resource, i18n as I18nextInstance } from 'i18next'
import { reactI18nPlugin } from './plugin'
import type { FormPlugin } from '@moluoxixi/core'
import type { I18nPluginAPI } from '@moluoxixi/plugin-i18n-core'
import type { I18nMessages, ReactMessageI18nRuntime, ReactMessageI18nRuntimeOptions } from './types'

function toResources(messages: I18nMessages, namespace: string): Resource {
  return Object.fromEntries(
    Object.entries(messages).map(([locale, values]) => [
      locale,
      { [namespace]: values },
    ]),
  )
}

function translate(i18n: I18nextInstance, key: string, params?: Record<string, unknown>): string {
  const t = i18n.t as unknown as (nextKey: string, nextParams?: Record<string, unknown>) => string
  return String(t(key, params))
}

export function createReactMessageI18nRuntime(options: ReactMessageI18nRuntimeOptions): ReactMessageI18nRuntime {
  const {
    messages,
    locale,
    fallbackLocale,
    namespace = 'translation',
    i18n: providedI18n,
    ...pluginOptions
  } = options

  const availableLocales = Object.keys(messages)
  const resolvedFallback = fallbackLocale ?? availableLocales[0] ?? ''
  const resolvedLocale = locale ?? resolvedFallback
  const i18n = providedI18n ?? i18next.createInstance()

  if (!i18n.isInitialized) {
    void i18n.init({
      resources: toResources(messages, namespace),
      lng: resolvedLocale,
      fallbackLng: resolvedFallback || undefined,
      defaultNS: namespace,
      ns: [namespace],
      interpolation: { escapeValue: false },
      initImmediate: false,
    })
  }
  else {
    for (const [localeName, values] of Object.entries(messages)) {
      i18n.addResourceBundle(localeName, namespace, values, true, true)
    }
    if (resolvedLocale) {
      void i18n.changeLanguage(resolvedLocale)
    }
  }

  const rawPlugin = reactI18nPlugin({
    ...pluginOptions,
    i18n,
    locale: resolvedLocale,
  })
  let pluginApi: I18nPluginAPI | undefined
  const plugin: FormPlugin<I18nPluginAPI> = {
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

  const subscribeLocale = (listener: (nextLocale: string) => void): (() => void) => {
    const handler = (nextLocale: string): void => {
      listener(nextLocale)
    }
    i18n.on('languageChanged', handler)
    return () => {
      i18n.off('languageChanged', handler)
    }
  }

  const t = (key: string, params?: Record<string, unknown>): string => {
    return translate(i18n, key, params)
  }

  return {
    plugin,
    i18n,
    t,
    getLocale: () => i18n.resolvedLanguage || i18n.language || resolvedLocale || '',
    setLocale: async (nextLocale) => {
      if (pluginApi) {
        await pluginApi.setLocale(nextLocale)
        return
      }
      await i18n.changeLanguage(nextLocale)
    },
    subscribeLocale,
  }
}
