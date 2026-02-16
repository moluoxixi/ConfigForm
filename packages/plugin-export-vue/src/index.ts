/**
 * @moluoxixi/plugin-export-vue
 *
 * Vue 导出插件（仅导出插件工厂）：
 * - 注册后直接使用 form.getExportData / form.exportJSON / form.downloadJSON
 */
export { exportPlugin } from '@moluoxixi/plugin-export-core'
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
} from '@moluoxixi/plugin-export-core'
