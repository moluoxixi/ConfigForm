import { ElCollapse, ElCollapseItem } from 'element-plus'
import { useField, useSchemaItems, RecursionField } from '@moluoxixi/vue'
import { defineComponent, h, ref } from 'vue'

/**
 * 折叠面板布局容器（Schema 感知模式）
 */
export const LayoutCollapse = defineComponent({
  name: 'CfLayoutCollapse',
  setup() {
    const field = useField()
    const items = useSchemaItems()
    const activeKeys = ref(items.map(item => item.name))

    return () => h(ElCollapse, {
      'modelValue': activeKeys.value,
      'onUpdate:modelValue': (keys: string[]) => { activeKeys.value = keys },
    }, () => items.map(item =>
      h(ElCollapseItem, { key: item.name, name: item.name, title: item.title }, () =>
        h(RecursionField, {
          schema: item.schema,
          name: item.name,
          basePath: field.path,
          onlyRenderProperties: true,
        }),
      ),
    ))
  },
})
