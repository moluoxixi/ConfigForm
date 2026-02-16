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
  FormLayoutSymbol,
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
export type { IArrayBaseContext, IArrayBaseItemContext } from './components'

/* Composables */
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
} from './composables'
export type { SchemaItem } from './composables'

/* 上下文（高级用法） */
export { ComponentRegistrySymbol, FieldSymbol, FormSymbol, SchemaSymbol } from './context'

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
} from './registry'
export type { ComponentScope, RegisterComponentOptions, RegistryState } from './registry'

/* 类型 re-export（供 playground 直接使用 */
export type { FieldPattern } from '@moluoxixi/core'
