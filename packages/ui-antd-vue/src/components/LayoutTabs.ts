import { Badge as ABadge, TabPane as ATabPane, Tabs as ATabs } from 'ant-design-vue'
import { useField, useForm, useSchemaItems, RecursionField } from '@moluoxixi/vue'
import { defineComponent, h, ref, watch } from 'vue'

/**
 * 标签页布局容器（Ant Design Vue）
 *
 * 功能：
 * - 每个 Tab 页签显示该面板下的验证错误数量（Badge）
 * - 提交失败时自动跳转到第一个有错误的 Tab
 */
export const LayoutTabs = defineComponent({
  name: 'CfLayoutTabs',
  setup() {
    const field = useField()
    const form = useForm()
    const items = useSchemaItems()
    const activeKey = ref(items.length > 0 ? items[0].name : '')

    /** 统计某个面板下的验证错误数量 */
    const getErrorCount = (itemName: string): number => {
      const prefix = `${field.path}.${itemName}`
      return form.errors.filter(
        e => e.path === prefix || e.path.startsWith(`${prefix}.`),
      ).length
    }

    /** 提交失败时自动跳转到第一个有错误的 Tab */
    watch(() => form.errors.length, () => {
      if (form.errors.length === 0) return
      const currentItem = items.find(item => item.name === activeKey.value)
      if (currentItem && getErrorCount(currentItem.name) > 0) return

      const firstErrorItem = items.find(item => getErrorCount(item.name) > 0)
      if (firstErrorItem && firstErrorItem.name !== activeKey.value) {
        activeKey.value = firstErrorItem.name
      }
    })

    return () => h(ATabs, {
      'activeKey': activeKey.value,
      'onUpdate:activeKey': (k: string) => { activeKey.value = k },
    }, () => items.map(item => {
      const errorCount = getErrorCount(item.name)

      /** Tab 标题：带错误 Badge */
      const tabLabel = errorCount > 0
        ? h('span', { style: 'display: inline-flex; align-items: center; gap: 4px' }, [
            item.title,
            h(ABadge, { count: errorCount, size: 'small' }),
          ])
        : item.title

      return h(ATabPane, { key: item.name, tab: tabLabel, forceRender: true }, () =>
        h(RecursionField, {
          schema: item.schema,
          name: item.name,
          basePath: field.path,
          onlyRenderProperties: true,
        }),
      )
    }))
  },
})
