import type { FormPlugin } from '@moluoxixi/core'
import type { I18nPluginAPI, I18nPluginConfig, TranslateFunction } from '@moluoxixi/plugin-i18n-core'
import type { I18n } from 'vue-i18n'

export type I18nMessages = Record<string, Record<string, string>>

export interface VueComposerLike {
  t: (key: string, params?: Record<string, unknown>) => string
  locale: string | { value: string }
}

export type VueI18nLike = I18n | VueComposerLike

export interface VueI18nPluginOptions extends Omit<I18nPluginConfig, 't' | 'changeLocale' | 'onLocaleChange' | 'locale'> {
  i18n: VueI18nLike
  locale?: string
}

export interface VueMessageI18nRuntimeOptions extends Omit<VueI18nPluginOptions, 'i18n'> {
  messages: I18nMessages
  locale?: string
  fallbackLocale?: string
  i18n?: I18n
}

export interface VueMessageI18nRuntime {
  plugin: FormPlugin<I18nPluginAPI>
  i18n: I18n
  t: TranslateFunction
  getLocale: () => string
  setLocale: (locale: string) => void
  subscribeLocale: (listener: (locale: string) => void) => () => void
}
