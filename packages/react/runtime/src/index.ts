/**
 * react 包统一导出入口。
 * 该文件聚合 React 运行时组件、Hook、上下文与注册系统导出，
 * 供应用层按需引入并保持导入路径一致性。
 * 维护时请按能力域分组导出，便于定位与后续扩展。
 */
/* 组件 */
export {
  ArrayBase,
  ArrayField,
  ArrayItems,
  ArrayTable,
  ConfigForm,
  DiffViewer,
  FormArrayField,
  FormField,
  FormLayout,
  FormLayoutContext,
  FormObjectField,
  FormProvider,
  FormVoidField,
  ReactiveField,
  RecursionField,
  SchemaField,
  useArray,
  useFormLayout,
  useIndex,
} from './components'
export type {
  ArrayFieldProps,
  ArrayTableProps,
  ConfigFormProps,
  DiffViewerProps,
  FormArrayFieldComponentProps,
  FormFieldProps,
  FormLayoutConfig,
  FormLayoutProps,
  FormObjectFieldProps,
  FormProviderProps,
  FormVoidFieldProps,
  ReactiveFieldProps,
  RecursionFieldProps,
  SchemaFieldProps,
} from './components'

/* 上下文（高级用法） */
export { ComponentRegistryContext, FieldContext, FormContext, SchemaContext } from './context'

/* Hooks */
export {
  useCreateForm,
  useField,
  useFieldByPath,
  useFieldSchema,
  useForm,
  useFormSubmitting,
  useFormValid,
  useFormValues,
  useSchemaItems,
} from './hooks'
export type { SchemaItem } from './hooks'

/* 响应式桥接（供 UI 层复用，避免直接依赖 reactive-react） */
export { observer } from './reactive'

/* 注册 */
export {
  createComponentScope,
  createRegistry,
  createRegistryState,
  getAction,
  getComponent,
  getDecorator,
  getDefaultDecorator,
  getReadPrettyComponent,
  registerAction,
  registerActions,
  registerComponent,
  registerComponents,
  registerDecorator,
  registerFieldComponents,
  resetRegistry,
  subscribeRegistryChange,
} from './registry'
export type { ComponentScope, RegisterComponentOptions, RegistryState } from './registry'

/* 类型 re-export（供 playground 直接使用 */
export type { FieldPattern } from '@moluoxixi/core'
