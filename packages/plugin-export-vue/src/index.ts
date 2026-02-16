/**
 * @moluoxixi/plugin-export-vue
 *
 * Vue 场景导出适配：
 * - 默认浏览器下载适配器
 * - Runtime 包装，便于按钮直接调用导出 API
 */
export { browserDownload } from './browser'
export { vueFormExportPlugin } from './plugin'
export { createVueFormExportRuntime } from './runtime'
export type { VueFormExportPluginOptions, VueFormExportRuntime } from './types'
