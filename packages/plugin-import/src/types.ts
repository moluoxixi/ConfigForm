import type { FormPlugin } from '@moluoxixi/core'

/**
 * Import Set Value Strategy：类型别名定义。
 * 所属模块：`packages/plugin-import/src/types.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export type ImportSetValueStrategy = 'merge' | 'shallow' | 'replace'

/**
 * Form Import Options：类型接口定义。
 * 所属模块：`packages/plugin-import/src/types.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export interface FormImportOptions {
  strategy?: ImportSetValueStrategy
  allowInternal?: boolean
  excludePrefixes?: string[]
}

/**
 * Form Import JSONOptions：类型接口定义。
 * 所属模块：`packages/plugin-import/src/types.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export interface FormImportJSONOptions extends FormImportOptions {
  reviver?: (this: unknown, key: string, value: unknown) => unknown
}

/**
 * Form Import Result：类型接口定义。
 * 所属模块：`packages/plugin-import/src/types.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export interface FormImportResult {
  data: Record<string, unknown>
  appliedKeys: string[]
  skippedKeys: string[]
  strategy: ImportSetValueStrategy
  allowInternal: boolean
  excludePrefixes: string[]
}

/**
 * Form Import Plugin Config：类型接口定义。
 * 所属模块：`packages/plugin-import/src/types.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export interface FormImportPluginConfig {
  excludePrefixes?: string[]
}

/**
 * Form Import Plugin API：类型接口定义。
 * 所属模块：`packages/plugin-import/src/types.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export interface FormImportPluginAPI {
  parseImportJSON: (input: string | Record<string, unknown>, options?: FormImportJSONOptions) => FormImportResult
  applyImport: (data: Record<string, unknown>, options?: FormImportOptions) => FormImportResult
  importJSON: (input: string | Record<string, unknown>, options?: FormImportJSONOptions) => FormImportResult
  parseImportJSONFile: (file: File, options?: FormImportJSONOptions) => Promise<FormImportResult>
  importJSONFile: (file: File, options?: FormImportJSONOptions) => Promise<FormImportResult>
}

/**
 * Form Import Plugin：类型别名定义。
 * 所属模块：`packages/plugin-import/src/types.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export type FormImportPlugin = FormPlugin<FormImportPluginAPI>
/**
 * Form Import Plugin Options：类型别名定义。
 * 所属模块：`packages/plugin-import/src/types.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export type FormImportPluginOptions = FormImportPluginConfig

declare module '@moluoxixi/core' {
  /**
   * 为 `FormInstance` 注入导入插件能力。
   * 这些方法由导入插件在运行时挂载，未安装插件时可能为 `undefined`。
   */
  interface FormInstance {
    /**
     * 解析 JSON 字符串或对象，返回可应用的导入结果。
     *
     * @param input JSON 字符串或对象数据。
     * @param options 解析选项（策略、字段过滤等）。
     * @returns 结构化导入结果。
     */
    parseImportJSON?: FormImportPluginAPI['parseImportJSON']
    /**
     * 将数据应用到当前表单实例。
     *
     * @param data 待导入的表单值对象。
     * @param options 导入策略选项。
     * @returns 实际应用后的导入结果。
     */
    applyImport?: FormImportPluginAPI['applyImport']
    /**
     * 解析并立即应用导入数据。
     *
     * @param input JSON 字符串或对象数据。
     * @param options 导入选项。
     * @returns 导入执行结果。
     */
    importJSON?: FormImportPluginAPI['importJSON']
    /**
     * 解析 JSON 文件内容并返回导入结果。
     *
     * @param file 用户选择的 JSON 文件。
     * @param options 导入解析选项。
     * @returns 导入结果 Promise。
     */
    parseImportJSONFile?: FormImportPluginAPI['parseImportJSONFile']
    /**
     * 读取并应用 JSON 文件到当前表单。
     *
     * @param file 用户选择的 JSON 文件。
     * @param options 导入执行选项。
     * @returns 导入执行 Promise。
     */
    importJSONFile?: FormImportPluginAPI['importJSONFile']
  }
}
