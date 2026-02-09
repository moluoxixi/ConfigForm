import type { ISchema } from '@moluoxixi/core'
import { computed } from 'vue'
import { useField } from './useField'
import { useFieldSchema } from './useFieldSchema'

/** Schema 面板项 */
export interface SchemaItem {
  name: string
  title: string
  schema: ISchema
}

/**
 * 从当前字段的 Schema properties 中发现子面板
 *
 * 跨 UI 库通用的布局逻辑，Vue composable 版本。
 */
export function useSchemaItems(): SchemaItem[] {
  const field = useField()
  const schema = useFieldSchema()

  /* Vue 响应式：直接读取，无需 useMemo */
  const items = computed(() => {
    const result: SchemaItem[] = []
    if (!schema.properties) return result

    for (const [name, childSchema] of Object.entries(schema.properties)) {
      const childField = field.form.getAllVoidFields().get(`${field.path}.${name}`)
      if (childField && !childField.visible) continue

      result.push({
        name,
        title: (childSchema.componentProps as Record<string, unknown>)?.title as string ?? name,
        schema: childSchema,
      })
    }
    return result
  })

  return items.value
}
