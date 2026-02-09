/* 编译 */
export { compileSchema, DEFAULT_COMPONENT_MAPPING, resolveComponent } from './compiler'

/* 合并 */
export { mergeSchema } from './merge'

/* $ref 解析 */
export { resolveSchemaRefs } from './ref-resolver'

/* 转换 */
export { toArrayFieldProps, toFieldProps, toVoidFieldProps, transformSchema } from './transform'

/* 类型导出 */
export type {
  CompiledField,
  CompiledSchema,
  CompileOptions,
  FormSchema,
  ISchema,
  ISchemaConditionBranch,
  SchemaType,
} from './types'
