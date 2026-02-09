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
export { ReactionEngine } from './reaction/engine'

/* 类型导出 */
export type {
  ArrayFieldInstance,
  ArrayFieldProps,
  DataSourceConfig,
  FieldInstance,
  FieldProps,
  FieldState,
  FormConfig,
  FormGraph,
  FormInstance,
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

/* re-export 常用类型（供 playground 直接使用，避免依赖 @moluoxixi/shared） */
export type { FieldPattern } from '@moluoxixi/shared'
