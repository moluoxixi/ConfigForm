/* 组件 */
export {
  ConfigForm,
  FormArrayField,
  FormField,
  FormObjectField,
  FormProvider,
  FormVoidField,
  ReactiveField,
  SchemaField,
} from './components'
export type {
  ConfigFormProps,
  FormArrayFieldComponentProps,
  FormFieldProps,
  FormObjectFieldProps,
  FormProviderProps,
  FormVoidFieldProps,
  ReactiveFieldProps,
  SchemaFieldProps,
} from './components'

/* 上下文（高级用法） */
export { ComponentRegistryContext, FieldContext, FormContext } from './context'

/* Hooks */
export {
  useCreateForm,
  useField,
  useFieldByPath,
  useForm,
  useFormSubmitting,
  useFormValid,
  useFormValues,
} from './hooks'

/* 注册 */
export {
  getComponent,
  getDefaultWrapper,
  getReadPrettyComponent,
  getWrapper,
  registerComponent,
  registerComponents,
  registerFieldComponents,
  registerWrapper,
} from './registry'
export type { RegisterComponentOptions } from './registry'

/* 类型 re-export（供 playground 直接使用，避免依赖 @moluoxixi/shared） */
export type { FieldPattern } from '@moluoxixi/shared'
