import type { FormPlugin } from '@moluoxixi/core'
import type { I18nPluginAPI, I18nPluginConfig, TranslateFunction } from '@moluoxixi/plugin-i18n-core'
import type { i18n as I18nextInstance } from 'i18next'

export type I18nMessages = Record<string, Record<string, string>>

export interface ReactI18nPluginOptions extends Omit<I18nPluginConfig, 't' | 'changeLocale' | 'onLocaleChange' | 'locale'> {
  i18n: I18nextInstance
  locale?: string
}

export interface ReactMessageI18nRuntimeOptions extends Omit<ReactI18nPluginOptions, 'i18n'> {
  messages: I18nMessages
  locale?: string
  fallbackLocale?: string
  namespace?: string
  i18n?: I18nextInstance
}

export interface ReactMessageI18nRuntime {
  plugin: FormPlugin<I18nPluginAPI>
  i18n: I18nextInstance
  t: TranslateFunction
  getLocale: () => string
  setLocale: (locale: string) => Promise<void>
  subscribeLocale: (listener: (locale: string) => void) => () => void
}
