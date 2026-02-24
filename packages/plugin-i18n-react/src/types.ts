import type { FormPlugin } from '@moluoxixi/core'
import type { I18nPluginAPI, I18nPluginConfig, TranslateFunction } from '@moluoxixi/plugin-i18n-core'
import type { i18n as I18nextInstance } from 'i18next'

/**
 * I18n Messages：类型别名定义。
 * 所属模块：`packages/plugin-i18n-react/src/types.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export type I18nMessages = Record<string, Record<string, string>>

/**
 * React I18n Plugin Options：类型接口定义。
 * 所属模块：`packages/plugin-i18n-react/src/types.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export interface ReactI18nPluginOptions extends Omit<I18nPluginConfig, 't' | 'changeLocale' | 'onLocaleChange' | 'locale'> {
  i18n: I18nextInstance
  locale?: string
}

/**
 * React Message I18n Runtime Options：类型接口定义。
 * 所属模块：`packages/plugin-i18n-react/src/types.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export interface ReactMessageI18nRuntimeOptions extends Omit<ReactI18nPluginOptions, 'i18n'> {
  messages: I18nMessages
  locale?: string
  fallbackLocale?: string
  namespace?: string
  i18n?: I18nextInstance
}

/**
 * React Message I18n Runtime：类型接口定义。
 * 所属模块：`packages/plugin-i18n-react/src/types.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export interface ReactMessageI18nRuntime {
  plugin: FormPlugin<I18nPluginAPI>
  i18n: I18nextInstance
  t: TranslateFunction
  getLocale: () => string
  setLocale: (locale: string) => Promise<void>
  subscribeLocale: (listener: (locale: string) => void) => () => void
}
