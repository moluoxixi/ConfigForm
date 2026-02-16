/**
 * @moluoxixi/plugin-import-react
 *
 * React 导入插件（仅导出插件工厂）：
 * - 注册后直接使用 form.parseImportJSON / form.importJSON / form.importJSONFile
 */
export { importPlugin } from '@moluoxixi/plugin-import-core'
export type {
  FormImportJSONOptions,
  FormImportOptions,
  FormImportPlugin,
  FormImportPluginAPI,
  FormImportPluginConfig,
  FormImportPluginOptions,
  FormImportResult,
  ImportSetValueStrategy,
} from '@moluoxixi/plugin-import-core'
