/* 编译 */
export { compileSchema, DEFAULT_COMPONENT_MAPPING, resolveComponent } from './compiler'

/* 合并 */
export { mergeSchema } from './merge'

/* 转换 */
export { toArrayFieldProps, toFieldProps, toVoidFieldProps, transformSchema } from './transform'

/* 类型导出 */
export type {
  CompiledField,
  CompiledSchema,
  CompileOptions,
  FormSchema,
  ISchema,
  SchemaType,
} from './types'
