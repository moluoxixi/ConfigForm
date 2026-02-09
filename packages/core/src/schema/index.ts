/* 编译 */
export { compileSchema, DEFAULT_COMPONENT_MAPPING, resolveComponent } from './compiler'

/* 合并 */
export { mergeSchema } from './merge'

/* $ref 解析 */
export { resolveSchemaRefs } from './ref-resolver'

/* 转换 */
export { toArrayFieldProps, toFieldProps, toVoidFieldProps, transformSchema } from './transform'

/* Schema 验证 */
export { validateSchema } from './schema-validator'
export type { SchemaValidationError, SchemaValidationResult } from './schema-validator'

/* Schema i18n */
export { createSchemaTranslator, isI18nKey, translateSchema } from './i18n'
export type { SchemaI18nConfig, TranslateFunction } from './i18n'

/* Schema 模板 */
export { instantiateTemplate, registerTemplate, templateRegistry } from './template'
export type {
  SchemaTemplate,
  SchemaTemplateParam,
  TemplateInstantiateOptions,
} from './template'

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
