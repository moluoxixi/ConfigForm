import type { ISchema } from '@moluoxixi/core'
import { useMemo } from 'react'
import { useField } from './useField'
import { useFieldSchema } from './useFieldSchema'

/**
 * Schema 面板项
 *
 * 表示从 Schema properties 中发现的一个子面板（Tab / Collapse Panel / Step）。
 */
export interface SchemaItem {
  /** 面板 key（Schema property name） */
  name: string
  /** 面板标题（来自 childSchema.componentProps.title） */
  title: string
  /** 面板的 Schema 定义（用于 RecursionField 渲染内容） */
  schema: ISchema
}

/**
 * 从当前字段的 Schema properties 中发现子面板
 *
 * 跨 UI 库通用的布局逻辑：
 * 1. 读取当前字段的 Schema（useFieldSchema）
 * 2. 遍历 properties，提取每个 void 子节点的 title
 * 3. 检查子字段的 display 状态（支持联动隐藏面板）
 * 4. 返回面板列表供布局组件渲染
 *
 * 布局组件（LayoutTabs/LayoutCollapse/LayoutSteps）只需调用此 hook，
 * 再用各自 UI 库的 Tabs/Collapse/Steps 渲染面板。
 *
 * @example
 * ```tsx
 * function LayoutTabs() {
 *   const items = useSchemaItems()
 *   return <Tabs items={items.map(item => ({
 *     label: item.title,
 *     children: <RecursionField schema={item.schema} name={item.name} ... />,
 *   }))} />
 * }
 * ```
 */
export function useSchemaItems(): SchemaItem[] {
  const field = useField()
  const schema = useFieldSchema()

  return useMemo(() => {
    const result: SchemaItem[] = []
    if (!schema.properties)
      return result

    for (const [name, childSchema] of Object.entries(schema.properties)) {
      /* 检查子字段的 display 状态（支持联动隐藏面板） */
      const childField = field.form.getAllVoidFields().get(`${field.path}.${name}`)
      if (childField && !childField.visible)
        continue

      result.push({
        name,
        title: (childSchema.componentProps as Record<string, unknown>)?.title as string ?? name,
        schema: childSchema,
      })
    }
    return result
  }, [schema, field])
}
