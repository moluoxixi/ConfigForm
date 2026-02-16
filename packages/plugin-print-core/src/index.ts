/**
 * @moluoxixi/plugin-print-core
 *
 * 框架无关打印插件：
 * - 可选切换 preview 态
 * - 调用浏览器/宿主打印适配器
 */
export { formPrintPlugin, PLUGIN_NAME } from './plugin'
export type {
  FormPrintAdapters,
  FormPrintOptions,
  FormPrintPayload,
  FormPrintPlugin,
  FormPrintPluginAPI,
  FormPrintPluginConfig,
} from './types'
