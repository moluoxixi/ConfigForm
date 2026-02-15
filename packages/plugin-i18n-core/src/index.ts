/**
 * @moluoxixi/plugin-i18n-core
 *
 * 框架无关的 i18n 核心能力：
 * - 将外部 i18n 库的 t() 注入表单
 * - 提供 schema 翻译能力
 * - 通过 version/subscribe 驱动框架层重渲染
 */
export { i18nPlugin } from './plugin'
export {
  createSchemaTranslator,
  isI18nKey,
  translateSchema,
} from './schema-i18n'
export type { I18nPluginAPI, I18nPluginConfig } from './types'
export type { SchemaI18nConfig, TranslateFunction } from './schema-i18n'
