import type { ISchema } from '@moluoxixi/core'
import type { SchemaI18nConfig, TranslateFunction } from './schema-i18n'

/** i18n 插件配置 */
export interface I18nPluginConfig extends SchemaI18nConfig {
  /** 当前语言（可选，用于 UI 展示或外部读取） */
  locale?: string
  /** 切换语言（与具体 i18n 库对接） */
  changeLocale?: (locale: string) => void | Promise<void>
  /** 监听语言变化（返回取消监听函数） */
  onLocaleChange?: (listener: (locale: string) => void) => () => void
}

/** i18n 插件 API */
export interface I18nPluginAPI {
  /** 翻译函数 */
  t: TranslateFunction
  /** 当前刷新版本（语言或资源变化时递增） */
  readonly version: number
  /** 订阅版本变化（用于驱动 UI 重渲染） */
  subscribe: (listener: (version: number) => void) => () => void
  /** 获取当前语言 */
  getLocale: () => string | undefined
  /** 切换语言 */
  setLocale: (locale: string) => void | Promise<void>
  /** 触发表单重新翻译 */
  refresh: () => void
  /** 翻译 Schema */
  translateSchema: (schema: ISchema) => ISchema
}
