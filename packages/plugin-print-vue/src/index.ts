/**
 * @moluoxixi/plugin-print-vue
 *
 * Vue 打印插件（仅导出插件工厂）：
 * - 默认浏览器打印适配器
 * - 注册后直接使用 form.print()
 */
export { browserPrint } from './browser'
export { printPlugin } from './plugin'
export type { PrintPluginOptions } from './types'
export type {
  FormPrintAdapters,
  FormPrintOptions,
  FormPrintPayload,
  FormPrintPlugin,
  FormPrintPluginAPI,
  FormPrintPluginConfig,
  FormPrintTarget,
  FormPrintTargetResolver,
} from '@moluoxixi/plugin-print-core'
