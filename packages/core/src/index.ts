/* 工厂函数 */
export { createForm } from './createForm'

/* 事件系统 */
export { FormEventEmitter, FormLifeCycle } from './events'
export type { FormEvent, FormEventHandler } from './events'

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

/* 模型 */
export { Form } from './models/Form'
export { Field } from './models/Field'
export { ArrayField } from './models/ArrayField'
export { ObjectField } from './models/ObjectField'
export { VoidField } from './models/VoidField'

/* 联动引擎 */
export { ReactionEngine, ReactionTracer } from './reaction/engine'
export type { ReactionTraceRecord } from './reaction/engine'

/* Hook 管理器 */
export { FormHookManager } from './hooks'

/* 类型导出 */
export type {
  /* 字段 */
  ArrayFieldInstance,
  ArrayFieldProps,
  DataSourceConfig,
  FieldInstance,
  FieldProps,
  FieldState,
  /* 表单 */
  FormConfig,
  FormGraph,
  FormInstance,
  /* 插件系统 */
  FormPlugin,
  PluginContext,
  PluginInstallResult,
  FormHooks,
  /* Hook Handler 类型 */
  SubmitHook,
  SubmitHookContext,
  ValidateHook,
  ValidateHookContext,
  ValidateResult,
  SetValuesHook,
  SetValuesHookContext,
  CreateFieldHook,
  CreateFieldHookContext,
  ResetHook,
  ResetHookContext,
  /* 其他 */
  ObjectFieldInstance,
  ObjectFieldProps,
  ReactionContext,
  ReactionEffect,
  ReactionRule,
  RequestAdapter,
  RequestConfig,
  ResetOptions,
  SubmitResult,
  VoidFieldInstance,
  VoidFieldProps,
} from './types'

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

/* reactive — 响应式适配器 */
export {
  getReactiveAdapter,
  hasReactiveAdapter,
  resetReactiveAdapter,
  setReactiveAdapter,
} from './reactive'
export type { ComputedRef, ReactionOptions, ReactiveAdapter } from './reactive'

/* validator — 验证引擎 */
export {
  getFormatValidator,
  hasFormat,
  registerFormat,
  getMessage,
  getValidationLocale,
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
