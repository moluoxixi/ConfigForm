import { TabPane as ATabPane, Tabs as ATabs } from 'ant-design-vue'
import { useField, useSchemaItems, RecursionField } from '@moluoxixi/vue'
import { defineComponent, h, ref } from 'vue'

/**
 * 标签页布局容器（Schema 感知模式）
 *
 * 使用框架层 useSchemaItems() 发现子面板，
 * 用 RecursionField 渲染每个面板内容。
 */
export const LayoutTabs = defineComponent({
  name: 'CfLayoutTabs',
  setup() {
    const field = useField()
    const items = useSchemaItems()
    const activeKey = ref(items.length > 0 ? items[0].name : '')

    return () => h(ATabs, {
      'activeKey': activeKey.value,
      'onUpdate:activeKey': (k: string) => { activeKey.value = k },
    }, () => items.map(item =>
      h(ATabPane, { key: item.name, tab: item.title, forceRender: true }, () =>
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
