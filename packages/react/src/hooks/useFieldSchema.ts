import type { ISchema } from '@moluoxixi/core'
import { useContext } from 'react'
import { SchemaContext } from '../context'

/**
 * 获取当前字段的 Schema 定义
 *
 * 由 SchemaField 在渲染每个节点时注入。
 * 布局组件（LayoutTabs/LayoutCollapse/LayoutSteps）通过此 hook
 * 读取自身 Schema，遍历 properties 发现子面板，
 * 再用 RecursionField 自行渲染各面板内容。
 *
 * 参考 Formily 的 useFieldSchema()。
 *
 * @example
 * ```tsx
 * function LayoutTabs() {
 *   const schema = useFieldSchema()
 *   const tabs = Object.entries(schema.properties ?? {})
 *   // 用 RecursionField 渲染每个 tab 的内容
 * }
 * ```
 */
export function useFieldSchema(): ISchema {
  const schema = useContext(SchemaContext)
  if (!schema) {
    throw new Error('[ConfigForm] useFieldSchema 必须在 SchemaField 渲染的组件内使用')
  }
  return schema
}
