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

/* 功能增强模块 */
export {
  /* Undo/Redo */
  FormHistory,
  /* 脏检查 */
  checkDirty,
  deepEqual,
  getDiffView,
  isFieldDirty,
  /* 草稿自动保存 */
  FormDraftManager,
  LocalStorageAdapter,
  SessionStorageAdapter,
  /* ACL 权限 */
  FormACL,
  /* 数据脱敏 */
  createMasker,
  maskValue,
  registerMaskingType,
  /* 提交重试 */
  submitWithRetry,
  withTimeout,
  /* 子表单 */
  createSubForm,
  SubFormManager,
} from './features'
export type {
  HistoryRecord,
  FormHistoryConfig,
  DirtyCheckResult,
  FieldDiff,
  DraftConfig,
  DraftStorageAdapter,
  FieldPermission,
  FormACLConfig,
  PermissionRule,
  RolePermission,
  MaskingConfig,
  MaskingRule,
  MaskingType,
  RetryStrategy,
  SubmitRetryConfig,
  SubFormConfig,
  SyncMode,
} from './features'

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
