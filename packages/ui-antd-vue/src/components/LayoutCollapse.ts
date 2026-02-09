import { Collapse as ACollapse, CollapsePanel as ACollapsePanel } from 'ant-design-vue'
import { useField, useSchemaItems, RecursionField } from '@moluoxixi/vue'
import { defineComponent, h, ref } from 'vue'

/**
 * 折叠面板布局容器（Schema 感知模式）
 *
 * 使用框架层 useSchemaItems() 发现子面板，默认全部展开。
 */
export const LayoutCollapse = defineComponent({
  name: 'CfLayoutCollapse',
  setup() {
    const field = useField()
    const items = useSchemaItems()
    const activeKeys = ref(items.map(item => item.name))

    return () => h(ACollapse, {
      'activeKey': activeKeys.value,
      'onUpdate:activeKey': (keys: string[]) => { activeKeys.value = keys },
    }, () => items.map(item =>
      h(ACollapsePanel, { key: item.name, header: item.title }, () =>
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
