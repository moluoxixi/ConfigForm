/**
 * vue 包统一导出入口。
 * 本文件负责聚合 Vue 运行时组件、组合式函数、上下文与注册能力，
 * 为业务提供稳定单点导入路径，避免内部模块直连带来的升级风险。
 * 维护时建议按组件、composables、上下文、注册四个区块持续整理导出。
 */
/* 组件 */
export {
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
  useFormLayout,
} from './components'

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
  subscribeRegistryChange,
} from './registry'
export type { ComponentScope, RegisterComponentOptions, RegistryState } from './registry'

/* 类型 re-export（供 playground 直接使用 */
export type { FieldPattern } from '@moluoxixi/core'
