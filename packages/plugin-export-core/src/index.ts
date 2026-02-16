/**
 * @moluoxixi/plugin-export-core
 *
 * 统一导出插件：
 * - 注册后提供 form.getExportData / form.exportJSON / form.downloadJSON 能力
 * - 默认浏览器下载适配器
 */
export { browserDownload } from './browser'
export { exportPlugin } from './plugin'
export type {
  FormExportAdapters,
  FormExportDataOptions,
  FormExportDownloadJSONOptions,
  FormExportDownloadPayload,
  FormExportJSONOptions,
  FormExportPlugin,
  FormExportPluginAPI,
  FormExportPluginConfig,
  FormExportPluginOptions,
  FormExportPreview,
  FormExportPreviewOptions,
} from './types'
