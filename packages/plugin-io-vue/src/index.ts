/**
 * @moluoxixi/plugin-io-vue
 *
 * Vue 场景下的导入/导出/打印适配：
 * - 默认浏览器下载和打印适配器
 * - Runtime 包装，便于在页面按钮中直接调用 API
 */
export { browserDownload, browserPrint, readFileAsText } from './browser'
export { vueFormIOPlugin } from './plugin'
export { createVueFormIORuntime } from './runtime'
export type { VueFormIOPluginOptions, VueFormIORuntime } from './types'
