import type { FieldInstance, FormInstance, ISchema } from '@moluoxixi/core'
import { createContext } from 'react'

/** 表单上下文 */
export const FormContext = createContext<FormInstance | null>(null)
FormContext.displayName = 'ConfigFormContext'

/** 字段上下文 */
export const FieldContext = createContext<FieldInstance<any> | null>(null)
FieldContext.displayName = 'ConfigFieldContext'

/**
 * Schema 上下文
 *
 * SchemaField 在渲染每个节点时，将该节点的 ISchema 注入此上下文。
 * 布局组件（LayoutTabs/LayoutCollapse/LayoutSteps）通过 useFieldSchema() 读取，
 * 用于自行发现子面板并通过 RecursionField 渲染。
 *
 * 参考 Formily 的 SchemaContext + useFieldSchema()。
 */
export const SchemaContext = createContext<ISchema | null>(null)
SchemaContext.displayName = 'ConfigSchemaContext'

/**
 * 组件注册表上下文
 * 用于 Schema 驱动模式下的组件查找
 */
export interface ComponentRegistry {
  components: Map<string, React.ComponentType<any>>
  decorators: Map<string, React.ComponentType<any>>
  actions: Map<string, React.ComponentType<any>>
  defaultDecorators: Map<string, string>
  readPrettyComponents: Map<string, React.ComponentType<any>>
}

/**
 * 组件注册表上下文实例。
 *
 * 默认值为空映射，避免在极端情况下 `useContext` 返回 `undefined`。
 * 正常运行时由 `FormProvider` 注入合并后的注册表。
 */
export const ComponentRegistryContext = createContext<ComponentRegistry>({
  components: new Map(),
  decorators: new Map(),
  actions: new Map(),
  defaultDecorators: new Map(),
  readPrettyComponents: new Map(),
})
ComponentRegistryContext.displayName = 'ConfigComponentRegistryContext'
