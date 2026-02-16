/**
 * @moluoxixi/plugin-print-vue
 *
 * Vue 场景打印适配：
 * - 默认浏览器打印适配器
 * - Runtime 包装，便于按钮直接调用打印 API
 */
export { browserPrint } from './browser'
export { vueFormPrintPlugin } from './plugin'
export { createVueFormPrintRuntime } from './runtime'
export type { VueFormPrintPluginOptions, VueFormPrintRuntime } from './types'
