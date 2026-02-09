import type { ISchema } from '@moluoxixi/core'
import { inject } from 'vue'
import { SchemaSymbol } from '../context'

/**
 * 获取当前字段的 Schema 定义
 *
 * 由 SchemaField 在渲染每个节点时注入。
 * 布局组件（LayoutTabs/LayoutCollapse/LayoutSteps）通过此 composable
 * 读取自身 Schema，遍历 properties 发现子面板。
 */
export function useFieldSchema(): ISchema {
  const schema = inject(SchemaSymbol)
  if (!schema) {
    throw new Error('[ConfigForm] useFieldSchema 必须在 SchemaField 渲染的组件内使用')
  }
  return schema
}
