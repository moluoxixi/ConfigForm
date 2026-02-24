import type { FormPlugin } from '@moluoxixi/core'

/**
 * Form Export Download Payload：描述该模块对外暴露的数据结构。
 * 所属模块：`packages/plugin-export/src/types.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export interface FormExportDownloadPayload {
  filename: string
  mimeType: string
  content: string
}

/**
 * Form Export Adapters：描述该模块对外暴露的数据结构。
 * 所属模块：`packages/plugin-export/src/types.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export interface FormExportAdapters {
  download?: (payload: FormExportDownloadPayload) => void | Promise<void>
}

/**
 * Form Export Data Options：描述该模块对外暴露的数据结构。
 * 所属模块：`packages/plugin-export/src/types.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export interface FormExportDataOptions {
  excludePrefixes?: string[]
}

/**
 * Form Export Preview Options：描述该模块对外暴露的数据结构。
 * 所属模块：`packages/plugin-export/src/types.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export interface FormExportPreviewOptions extends FormExportDataOptions {
  jsonSpace?: number
}

/**
 * Form Export JSONOptions：描述该模块对外暴露的数据结构。
 * 所属模块：`packages/plugin-export/src/types.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export interface FormExportJSONOptions extends FormExportDataOptions {
  space?: number
}

/**
 * Form Export Download JSONOptions：描述该模块对外暴露的数据结构。
 * 所属模块：`packages/plugin-export/src/types.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export interface FormExportDownloadJSONOptions extends FormExportJSONOptions {
  filename?: string
}

/**
 * Form Export Preview：描述该模块对外暴露的数据结构。
 * 所属模块：`packages/plugin-export/src/types.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export interface FormExportPreview {
  data: Record<string, unknown>
  json: string
}

/**
 * Form Export Plugin Config：描述该模块对外暴露的数据结构。
 * 所属模块：`packages/plugin-export/src/types.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export interface FormExportPluginConfig {
  excludePrefixes?: string[]
  filenameBase?: string | (() => string)
  jsonSpace?: number
  adapters?: FormExportAdapters
}

/**
 * Form Export Plugin API：描述该模块对外暴露的数据结构。
 * 所属模块：`packages/plugin-export/src/types.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export interface FormExportPluginAPI {
  getExportData: (options?: FormExportDataOptions) => Record<string, unknown>
  getExportPreview: (options?: FormExportPreviewOptions) => FormExportPreview
  subscribeExportPreview: (listener: (preview: FormExportPreview) => void, options?: FormExportPreviewOptions) => () => void
  exportJSON: (options?: FormExportJSONOptions) => string
  downloadJSON: (options?: FormExportDownloadJSONOptions) => Promise<void>
}

/**
 * Form Export Plugin：描述该模块使用的类型别名语义。
 * 所属模块：`packages/plugin-export/src/types.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export type FormExportPlugin = FormPlugin<FormExportPluginAPI>
/**
 * Form Export Plugin Options：描述该模块使用的类型别名语义。
 * 所属模块：`packages/plugin-export/src/types.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export type FormExportPluginOptions = FormExportPluginConfig

declare module '@moluoxixi/core' {
  /**
   * 为 `FormInstance` 注入导出插件能力。
   * 这些方法由导出插件在运行时挂载，未安装插件时可能为 `undefined`。
   */
  interface FormInstance {
    /**
     * 获取可导出的表单值对象。
     *
     * @param options 导出数据选项，用于控制字段过滤策略。
     * @returns 导出的键值对象。
     */
    getExportData?: FormExportPluginAPI['getExportData']
    /**
     * 生成导出预览数据（对象 + JSON 字符串）。
     *
     * @param options 预览选项，例如缩进空格与排除前缀。
     * @returns 可用于 UI 预览的导出结果。
     */
    getExportPreview?: FormExportPluginAPI['getExportPreview']
    /**
     * 订阅导出预览变化并返回取消订阅函数。
     *
     * @param listener 预览变化时触发的回调。
     * @param options 预览生成选项。
     * @returns 取消订阅函数。
     */
    subscribeExportPreview?: FormExportPluginAPI['subscribeExportPreview']
    /**
     * 将当前表单值导出为 JSON 字符串。
     *
     * @param options JSON 导出选项。
     * @returns JSON 字符串。
     */
    exportJSON?: FormExportPluginAPI['exportJSON']
    /**
     * 下载当前表单值对应的 JSON 文件。
     *
     * @param options 下载选项，例如文件名。
     * @returns 下载流程完成后的 Promise。
     */
    downloadJSON?: FormExportPluginAPI['downloadJSON']
  }
}
