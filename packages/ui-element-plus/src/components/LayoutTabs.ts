import { ElTabPane, ElTabs } from 'element-plus'
import { useField, useSchemaItems, RecursionField } from '@moluoxixi/vue'
import { defineComponent, h, ref } from 'vue'

/**
 * 标签页布局容器（Schema 感知模式）
 */
export const LayoutTabs = defineComponent({
  name: 'CfLayoutTabs',
  setup() {
    const field = useField()
    const items = useSchemaItems()
    const activeKey = ref(items.length > 0 ? items[0].name : '')

    return () => h(ElTabs, {
      'modelValue': activeKey.value,
      'onUpdate:modelValue': (k: string) => { activeKey.value = k },
    }, () => items.map(item =>
      h(ElTabPane, { key: item.name, name: item.name, label: item.title }, () =>
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
