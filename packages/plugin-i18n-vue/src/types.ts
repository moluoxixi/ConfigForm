import type { FormPlugin } from '@moluoxixi/core'
import type { I18nPluginAPI, I18nPluginConfig, TranslateFunction } from '@moluoxixi/plugin-i18n-core'
import type { I18n } from 'vue-i18n'

/**
 * I18n Messages：类型别名定义。
 * 所属模块：`packages/plugin-i18n-vue/src/types.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export type I18nMessages = Record<string, Record<string, string>>

/**
 * Vue Composer Like：类型接口定义。
 * 所属模块：`packages/plugin-i18n-vue/src/types.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export interface VueComposerLike {
  t: (key: string, params?: Record<string, unknown>) => string
  locale: string | { value: string }
}

/**
 * Vue I18n Like：类型别名定义。
 * 所属模块：`packages/plugin-i18n-vue/src/types.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export type VueI18nLike = I18n | VueComposerLike

/**
 * Vue I18n Plugin Options：类型接口定义。
 * 所属模块：`packages/plugin-i18n-vue/src/types.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export interface VueI18nPluginOptions extends Omit<I18nPluginConfig, 't' | 'changeLocale' | 'onLocaleChange' | 'locale'> {
  i18n: VueI18nLike
  locale?: string
}

/**
 * Vue Message I18n Runtime Options：类型接口定义。
 * 所属模块：`packages/plugin-i18n-vue/src/types.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export interface VueMessageI18nRuntimeOptions extends Omit<VueI18nPluginOptions, 'i18n'> {
  messages: I18nMessages
  locale?: string
  fallbackLocale?: string
  i18n?: I18n
}

/**
 * Vue Message I18n Runtime：类型接口定义。
 * 所属模块：`packages/plugin-i18n-vue/src/types.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export interface VueMessageI18nRuntime {
  plugin: FormPlugin<I18nPluginAPI>
  i18n: I18n
  t: TranslateFunction
  getLocale: () => string
  setLocale: (locale: string) => void
  subscribeLocale: (listener: (locale: string) => void) => () => void
}
