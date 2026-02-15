import { i18nPlugin } from '@moluoxixi/plugin-i18n-core'
import type { FormPlugin } from '@moluoxixi/core'
import type { I18nPluginAPI } from '@moluoxixi/plugin-i18n-core'
import type { i18n as I18nextInstance } from 'i18next'
import type { ReactI18nPluginOptions } from './types'

function resolveLocale(i18n: I18nextInstance, fallback?: string): string {
  return i18n.resolvedLanguage || i18n.language || fallback || ''
}

function translate(i18n: I18nextInstance, key: string, params?: Record<string, unknown>): string {
  const t = i18n.t as unknown as (nextKey: string, nextParams?: Record<string, unknown>) => string
  return String(t(key, params))
}

export function reactI18nPlugin(options: ReactI18nPluginOptions): FormPlugin<I18nPluginAPI> {
  const { i18n, locale, ...rest } = options

  return i18nPlugin({
    ...rest,
    locale: locale ?? resolveLocale(i18n),
    t: (key, params) => translate(i18n, key, params),
    changeLocale: async (nextLocale) => {
      await i18n.changeLanguage(nextLocale)
    },
    onLocaleChange: (listener) => {
      const handler = (nextLocale: string): void => {
        listener(nextLocale)
      }
      i18n.on('languageChanged', handler)
      return () => {
        i18n.off('languageChanged', handler)
      }
    },
  })
}
