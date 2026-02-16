/**
 * @moluoxixi/plugin-import-core
 *
 * 框架无关导入插件：
 * - 解析 JSON / CSV
 * - 应用导入（merge / shallow / replace）
 * - 一步导入 JSON / CSV
 */
export { formImportPlugin, PLUGIN_NAME } from './plugin'
export { ensurePlainObject, parseCSV, parseCSVRows, parseJSON } from './serialize'
export type {
  FormImportCSVOptions,
  FormImportJSONOptions,
  FormImportOptions,
  FormImportPlugin,
  FormImportPluginAPI,
  FormImportPluginConfig,
  FormImportResult,
  ImportSetValueStrategy,
} from './types'
