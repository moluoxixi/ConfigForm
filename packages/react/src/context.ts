import type { FieldInstance, FormInstance, ISchema } from '@moluoxixi/core'
import { createContext } from 'react'

/** 表单上下文 */
export const FormContext = createContext<FormInstance | null>(null)
FormContext.displayName = 'ConfigFormContext'

/** 字段上下文 */
export const FieldContext = createContext<FieldInstance | null>(null)
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
}

export const ComponentRegistryContext = createContext<ComponentRegistry>({
  components: new Map(),
  decorators: new Map(),
})
ComponentRegistryContext.displayName = 'ConfigComponentRegistryContext'
