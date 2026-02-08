/* 组件 */
export {
  ArrayBase,
  ArrayItems,
  ConfigForm,
  FormArrayField,
  FormField,
  FormObjectField,
  FormProvider,
  FormVoidField,
  ReactiveField,
  RecursionField,
  SchemaField,
  useArray,
  useIndex,
} from './components'

/* Composables */
export {
  useCreateForm,
  useField,
  useFieldByPath,
  useForm,
  useFormSubmitting,
  useFormValid,
  useFormValues,
} from './composables'

/* 上下文（高级用法） */
export { ComponentRegistrySymbol, FieldSymbol, FormSymbol } from './context'

/* 注册 */
export {
  createComponentScope,
  getComponent,
  getDefaultWrapper,
  getReadPrettyComponent,
  getWrapper,
  registerComponent,
  registerComponents,
  registerFieldComponents,
  registerWrapper,
} from './registry'
export type { ComponentScope, RegisterComponentOptions } from './registry'

/* 类型 re-export（供 playground 直接使用，避免依赖 @moluoxixi/shared） */
export type { FieldPattern } from '@moluoxixi/shared'
