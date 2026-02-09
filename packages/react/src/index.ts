/* 组件 */
export {
  ArrayItems,
  ArrayTable,
  ConfigForm,
  FormArrayField,
  FormField,
  FormObjectField,
  FormProvider,
  FormVoidField,
  ReactiveField,
  RecursionField,
  SchemaField,
} from './components'
export type {
  ArrayItemsProps,
  ArrayTableProps,
  ConfigFormProps,
  FormArrayFieldComponentProps,
  FormFieldProps,
  FormObjectFieldProps,
  FormProviderProps,
  FormVoidFieldProps,
  ReactiveFieldProps,
  RecursionFieldProps,
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
  getDecorator,
  getDefaultDecorator,
  getReadPrettyComponent,
  registerComponent,
  registerComponents,
  registerDecorator,
  registerFieldComponents,
} from './registry'
export type { RegisterComponentOptions } from './registry'

/* 类型 re-export（供 playground 直接使用，避免依赖 @moluoxixi/shared） */
export type { FieldPattern } from '@moluoxixi/core'
