/**
 * @moluoxixi/plugin-import-vue
 *
 * Vue 场景导入适配：
 * - 文件读取辅助（JSON / CSV）
 * - Runtime 包装，便于按钮直接调用导入 API
 */
export { readFileAsText } from './browser'
export { vueFormImportPlugin } from './plugin'
export { createVueFormImportRuntime } from './runtime'
export type { VueFormImportPluginOptions, VueFormImportRuntime } from './types'
