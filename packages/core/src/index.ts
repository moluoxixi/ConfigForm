/* 工厂函数 */
export { createForm } from './createForm'

/* 事件系统 */
export { FormEventEmitter, FormLifeCycle } from './events'
export type { FormEvent, FormEventHandler } from './events'

/* 数据源 */
export { clearDataSourceCache, fetchDataSource, registerRequestAdapter } from './datasource/manager'
export { ArrayField } from './models/ArrayField'
export { Field } from './models/Field'
/* 模型 */
export { Form } from './models/Form'

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
  FieldStateUpdate,
  FormConfig,
  FormInstance,
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
