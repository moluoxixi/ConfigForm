/* 组件 */
export {
  ArrayCards,
  ArrayCollapse,
  ArrayItems,
  ArrayTable,
  ConfigForm,
  DevTools,
  DiffViewer,
  Editable,
  EditablePopover,
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
  Space,
  useFormLayout,
} from './components'
export type {
  ArrayCardsProps,
  ArrayCollapseProps,
  ArrayItemsProps,
  ArrayTableProps,
  ConfigFormProps,
  DevToolsProps,
  DiffViewerProps,
  EditablePopoverProps,
  EditableProps,
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
  SpaceProps,
} from './components'

/* 上下文（高级用法） */
export { ComponentRegistryContext, FieldContext, FormContext, SchemaContext } from './context'

/* Hooks */
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
} from './hooks'
export type { SchemaItem } from './hooks'

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
