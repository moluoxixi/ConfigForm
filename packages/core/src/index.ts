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

/* re-export 底层公共类型（门面模式，上层包只依赖 core） */
export type {
  ComponentType,
  DataSourceItem,
  Disposer,
  FieldDisplay,
  FieldPattern,
  FieldStateUpdate,
} from '@moluoxixi/shared'

export type {
  ValidationFeedback,
  ValidationRule,
  ValidationTrigger,
} from '@moluoxixi/validator'
