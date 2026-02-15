/* 编译 */
export { compileSchema, DEFAULT_COMPONENT_MAPPING, isStructuralArrayComponent, resolveComponent } from './compiler'

/* 合并 */
export { mergeSchema } from './merge'

/* $ref 解析 */
export { resolveSchemaRefs } from './ref-resolver'
/* Schema 验证 */
export { validateSchema } from './schema-validator'

export type { SchemaValidationError, SchemaValidationResult } from './schema-validator'
/* Schema 模板 */
export { instantiateTemplate, registerTemplate, templateRegistry } from './template'

export type {
  SchemaTemplate,
  SchemaTemplateParam,
  TemplateInstantiateOptions,
} from './template'
/* 转换 */
export { toArrayFieldProps, toFieldProps, toVoidFieldProps, transformSchema } from './transform'

/* 类型导出 */
export type {
  BuiltinDecoratorName,
  BuiltinFieldComponent,
  BuiltinStructuralArrayComponent,
  CompiledField,
  CompiledSchema,
  CompileOptions,
  FormSchema,
  ISchema,
  ISchemaConditionBranch,
  SchemaComponentName,
  SchemaDecoratorName,
  SchemaType,
} from './types'
export {
  BUILTIN_DECORATORS,
  BUILTIN_FIELD_COMPONENTS,
  BUILTIN_STRUCTURAL_ARRAY_COMPONENTS,
} from './types'
