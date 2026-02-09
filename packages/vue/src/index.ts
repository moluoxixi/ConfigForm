/* 组件 */
export {
  ArrayBase,
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
  useArray,
  useIndex,
} from './components'

/* Composables */
export {
  useCreateForm,
  useField,
  useFieldByPath,
  useFieldSchema,
  useSchemaItems,
  useForm,
  useFormSubmitting,
  useFormValid,
  useFormValues,
} from './composables'
export type { SchemaItem } from './composables'

/* 上下文（高级用法） */
export { ComponentRegistrySymbol, FieldSymbol, FormSymbol, SchemaSymbol } from './context'

/* 注册 */
export {
  createComponentScope,
  getComponent,
  getDecorator,
  getDefaultDecorator,
  getReadPrettyComponent,
  registerComponent,
  registerComponents,
  registerDecorator,
  registerFieldComponents,
} from './registry'
export type { ComponentScope, RegisterComponentOptions } from './registry'

/* 类型 re-export（供 playground 直接使用 */
export type { FieldPattern } from '@moluoxixi/core'
