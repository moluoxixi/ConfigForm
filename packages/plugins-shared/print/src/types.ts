import type { FieldPattern, FormInstance, FormPlugin } from '@moluoxixi/core'

/**
 * Form Print Target Resolver：描述该模块使用的类型别名语义。
 * 所属模块：`packages/plugin-print/src/types.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export type FormPrintTargetResolver = () => string | Element | null | undefined
/**
 * Form Print Target：描述该模块使用的类型别名语义。
 * 所属模块：`packages/plugin-print/src/types.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export type FormPrintTarget = string | Element | FormPrintTargetResolver

/**
 * Form Print Payload：描述该模块对外暴露的数据结构。
 * 所属模块：`packages/plugin-print/src/types.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export interface FormPrintPayload {
  title?: string
  values: Record<string, unknown>
  json: string
  text: string
  form: FormInstance
  target?: string | Element
}

/**
 * Form Print Adapters：描述该模块对外暴露的数据结构。
 * 所属模块：`packages/plugin-print/src/types.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export interface FormPrintAdapters {
  print?: (payload: FormPrintPayload) => void | Promise<void>
}

/**
 * Form Print Options：描述该模块对外暴露的数据结构。
 * 所属模块：`packages/plugin-print/src/types.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export interface FormPrintOptions {
  excludePrefixes?: string[]
  title?: string
  target?: FormPrintTarget
  switchPattern?: boolean
  restorePattern?: boolean
  previewPattern?: FieldPattern
  formatText?: (values: Record<string, unknown>) => string
}

/**
 * Form Print Plugin Config：描述该模块对外暴露的数据结构。
 * 所属模块：`packages/plugin-print/src/types.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export interface FormPrintPluginConfig {
  excludePrefixes?: string[]
  jsonSpace?: number
  adapters?: FormPrintAdapters
  print?: {
    title?: string
    target?: FormPrintTarget
    switchPattern?: boolean
    restorePattern?: boolean
    previewPattern?: FieldPattern
    formatText?: (values: Record<string, unknown>) => string
  }
}

/**
 * Form Print Plugin API：描述该模块对外暴露的数据结构。
 * 所属模块：`packages/plugin-print/src/types.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export interface FormPrintPluginAPI {
  print: (options?: FormPrintOptions) => Promise<void>
}
/**
 * Form Print Plugin：描述该模块使用的类型别名语义。
 * 所属模块：`packages/plugin-print/src/types.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export type FormPrintPlugin = FormPlugin<FormPrintPluginAPI>

declare module '@moluoxixi/core' {
  /**
   * 为 `FormInstance` 注入打印插件能力。
   * 该方法由打印插件在运行时挂载，未安装插件时可能为 `undefined`。
   */
  interface FormInstance {
    /**
     * 执行表单打印流程。
     *
     * @param options 打印选项，例如目标容器与模式切换策略。
     * @returns 打印流程完成后的 Promise。
     */
    print?: FormPrintPluginAPI['print']
  }
}
