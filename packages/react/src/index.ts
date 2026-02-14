/* 组件 */
export {
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
  useFormLayout,
} from './components'
export type {
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
  getComponent,
  getDecorator,
  getDefaultDecorator,
  getReadPrettyComponent,
  registerComponent,
  registerComponents,
  registerDecorator,
  registerFieldComponents,
  resetRegistry,
} from './registry'
export type { ComponentScope, RegisterComponentOptions, RegistryState } from './registry'

/* 类型 re-export（供 playground 直接使用 */
export type { FieldPattern } from '@moluoxixi/core'
