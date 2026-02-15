/**
 * @moluoxixi/plugin-i18n-vue
 *
 * Vue/vue-i18n 适配层：
 * - 将 vue-i18n 实例接入 ConfigForm i18n core 插件
 * - 提供基于 messages 表的快速运行时（用于 demo/测试）
 */
export { vueI18nPlugin } from './plugin'
export { createVueMessageI18nRuntime } from './runtime'
export type {
  I18nMessages,
  VueComposerLike,
  VueI18nLike,
  VueI18nPluginOptions,
  VueMessageI18nRuntime,
  VueMessageI18nRuntimeOptions,
} from './types'
