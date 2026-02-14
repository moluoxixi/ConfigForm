/* contracts — 跨框架渲染契约 */
export {
  createDecoratorRenderContract,
  createFieldInteractionContract,
  createFieldRenderContract,
} from './contracts'

export type {
  DecoratorRenderContract,
  FieldInteractionContract,
  FieldRenderContract,
} from './contracts'
/* 工厂函数 */
export { createForm } from './createForm'

/* 数据源 */
export { clearDataSourceCache, fetchDataSource, registerRequestAdapter } from './datasource/manager'

/* Effects API */
export {
  onFieldInit,
  onFieldInputChange,
  onFieldMount,
  onFieldReact,
  onFieldUnmount,
  onFieldValueChange,
  onFormReact,
} from './effects'

/* 事件系统 */
export { FormEventEmitter, FormLifeCycle } from './events'
export type { FormEvent, FormEventHandler } from './events'
/* Hook 管理器 */
export { FormHookManager } from './hooks'
export { ArrayField } from './models/ArrayField'
export { Field } from './models/Field'

/* 模型 */
export { Form } from './models/Form'
export { ObjectField } from './models/ObjectField'

export { VoidField } from './models/VoidField'
/* 联动引擎 */
export { ReactionEngine, ReactionTracer } from './reaction/engine'

export type { ReactionTraceRecord } from './reaction/engine'

/* reactive — 响应式适配器 */
export {
  getReactiveAdapter,
  hasReactiveAdapter,
  resetReactiveAdapter,
  setReactiveAdapter,
} from './reactive'

export type { ComputedRef, ReactionOptions, ReactiveAdapter } from './reactive'
/* schema — Schema 编译引擎 */
export {
  BUILTIN_DECORATORS,
  BUILTIN_FIELD_COMPONENTS,
  BUILTIN_STRUCTURAL_ARRAY_COMPONENTS,
  compileSchema,
  createSchemaTranslator,
  DEFAULT_COMPONENT_MAPPING,
  instantiateTemplate,
  isI18nKey,
  isStructuralArrayComponent,
  mergeSchema,
  registerTemplate,
  resolveComponent,
  resolveSchemaRefs,
  templateRegistry,
  toArrayFieldProps,
  toFieldProps,
  toVoidFieldProps,
  transformSchema,
  translateSchema,
  validateSchema,
} from './schema'

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
  SchemaI18nConfig,
  SchemaTemplate,
  SchemaTemplateParam,
  SchemaType,
  SchemaValidationError,
  SchemaValidationResult,
  TemplateInstantiateOptions,
  TranslateFunction,
} from './schema'
/* shared — 工具函数和公共类型 */
export {
  debounce,
  deepClone,
  deepMerge,
  evaluateExpression,
  FormPath,
  isArray,
  isBoolean,
  isEmpty,
  isExpression,
  isFunction,
  isNullish,
  isNumber,
  isObject,
  isPlainObject,
  isString,
  isValid,
  logger,
  uid,
} from './shared'

export type {
  ComponentType,
  DataSourceItem,
  Disposer,
  ExpressionScope,
  Feedback,
  FieldDisplay,
  FieldPattern,
  FieldStateUpdate,
} from './shared'
/* diff — 对比工具 */
export { deepEqual, diff, getDiffView } from './shared/diff'

export type { DiffEntry, DiffFieldView, DiffResult, DiffType } from './shared/diff'
/* 类型导出 */
export type {
  /* 字段 */
  ArrayFieldInstance,
  ArrayFieldProps,
  CreateFieldHook,
  CreateFieldHookContext,
  DataSourceConfig,
  FieldInstance,
  FieldProps,
  FieldState,
  /* 表单 */
  FormConfig,
  FormGraph,
  FormHooks,
  FormInstance,
  /* 插件系统 */
  FormPlugin,
  /* 其他 */
  ObjectFieldInstance,
  ObjectFieldProps,
  PluginContext,
  PluginInstallResult,
  ReactionContext,
  ReactionEffect,
  ReactionRule,
  RequestAdapter,
  RequestConfig,
  ResetHook,
  ResetHookContext,
  ResetOptions,
  SetValuesHook,
  SetValuesHookContext,
  /* Hook Handler 类型 */
  SubmitHook,
  SubmitHookContext,
  SubmitResult,
  ValidateHook,
  ValidateHookContext,
  ValidateResult,
  VoidFieldInstance,
  VoidFieldProps,
} from './types'

/* validator — 验证引擎 */
export {
  getFormatValidator,
  getMessage,
  getValidationLocale,
  hasFormat,
  registerFormat,
  registerMessages,
  setValidationLocale,
  validate,
  validateSync,
} from './validator'
export type {
  BuiltinFormat,
  FormatValidator,
  ValidationFeedback,
  ValidationMessages,
  ValidationResult,
  ValidationRule,
  ValidationTrigger,
  ValidatorContext,
} from './validator'
