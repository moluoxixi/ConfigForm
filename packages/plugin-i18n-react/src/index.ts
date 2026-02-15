/**
 * @moluoxixi/plugin-i18n-react
 *
 * React/i18next 适配层：
 * - 将 i18next 实例接入 ConfigForm i18n core 插件
 * - 提供基于 messages 表的快速运行时（用于 demo/测试）
 */
export { reactI18nPlugin } from './plugin'
export { createReactMessageI18nRuntime } from './runtime'
export type {
  I18nMessages,
  ReactI18nPluginOptions,
  ReactMessageI18nRuntime,
  ReactMessageI18nRuntimeOptions,
} from './types'
