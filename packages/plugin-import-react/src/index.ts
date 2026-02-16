/**
 * @moluoxixi/plugin-import-react
 *
 * React 场景导入适配：
 * - 文件读取辅助（JSON / CSV）
 * - Runtime 包装，便于按钮直接调用导入 API
 */
export { readFileAsText } from './browser'
export { reactFormImportPlugin } from './plugin'
export { createReactFormImportRuntime } from './runtime'
export type { ReactFormImportPluginOptions, ReactFormImportRuntime } from './types'
