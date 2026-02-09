/**
 * @moluoxixi/plugin-json-schema
 *
 * 标准 JSON Schema (Draft-07 / 2020-12) 到表单 ISchema 的适配转换插件。
 *
 * 核心能力：
 * - `fromJsonSchema()`：标准 JSON Schema → 表单 ISchema
 * - `toJsonSchema()`：表单 ISchema → 标准 JSON Schema
 *
 * 适用场景：
 * - 从后端 OpenAPI Spec 导入表单结构
 * - 从数据库 DDL 生成表单
 * - 与第三方系统交换表单定义
 *
 * @example
 * ```ts
 * import { fromJsonSchema, toJsonSchema } from '@moluoxixi/plugin-json-schema'
 * import { compileSchema } from '@moluoxixi/schema'
 *
 * // 从标准 JSON Schema 转换
 * const formSchema = fromJsonSchema(backendJsonSchema, {
 *   titleStrategy: 'keyToLabel',
 *   descriptionAsPlaceholder: true,
 * })
 *
 * // 可叠加表单专有配置
 * formSchema.decoratorProps = { labelWidth: '120px', actions: { submit: '提交' } }
 *
 * // 编译并使用
 * const compiled = compileSchema(formSchema)
 *
 * // 反向导出
 * const exported = toJsonSchema(formSchema)
 * ```
 */

/* 核心转换 */
export { fromJsonSchema, toJsonSchema } from './adapter'

/* 类型导出 */
export type {
  JsonSchemaAdapterOptions,
  JsonSchemaType,
  StandardJsonSchema,
} from './types'
