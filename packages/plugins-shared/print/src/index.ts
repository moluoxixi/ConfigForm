/**
 * @moluoxixi/plugin-print
 *
 * 框架无关打印插件：
 * - 可选切换 preview 态
 * - 调用浏览器/宿主打印适配器
 */
export { browserPrint } from './browser'
export { PLUGIN_NAME, printPlugin } from './plugin'
export type {
  FormPrintAdapters,
  FormPrintOptions,
  FormPrintPayload,
  FormPrintPlugin,
  FormPrintPluginAPI,
  FormPrintPluginConfig,
  FormPrintTarget,
  FormPrintTargetResolver,
} from './types'
