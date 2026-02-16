/**
 * @moluoxixi/plugin-print-react
 *
 * React 场景打印适配：
 * - 默认浏览器打印适配器
 * - Runtime 包装，便于按钮直接调用打印 API
 */
export { browserPrint } from './browser'
export { reactFormPrintPlugin } from './plugin'
export { createReactFormPrintRuntime } from './runtime'
export type { ReactFormPrintPluginOptions, ReactFormPrintRuntime } from './types'
