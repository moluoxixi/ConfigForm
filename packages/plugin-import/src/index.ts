/**
 * @moluoxixi/plugin-import
 *
 * 统一导入插件：
 * - 注册后提供 form.parseImportJSON / form.applyImport / form.importJSON 能力
 * - 可选文件读取辅助（JSON）
 */
export { readFileAsText } from './browser'
export { importPlugin } from './plugin'
export { ensurePlainObject, parseJSON } from './serialize'
export type {
  FormImportJSONOptions,
  FormImportOptions,
  FormImportPlugin,
  FormImportPluginAPI,
  FormImportPluginConfig,
  FormImportPluginOptions,
  FormImportResult,
  ImportSetValueStrategy,
} from './types'
