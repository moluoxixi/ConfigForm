import { ElBadge, ElTabPane, ElTabs } from 'element-plus'
import { useField, useForm, useSchemaItems, RecursionField } from '@moluoxixi/vue'
import { defineComponent, h, ref, watch } from 'vue'

/**
 * 标签页布局容器（Element Plus）
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

    const getErrorCount = (itemName: string): number => {
      const prefix = `${field.path}.${itemName}`
      return form.errors.filter(
        e => e.path === prefix || e.path.startsWith(`${prefix}.`),
      ).length
    }

    watch(() => form.errors.length, () => {
      if (form.errors.length === 0) return
      const currentItem = items.find(item => item.name === activeKey.value)
      if (currentItem && getErrorCount(currentItem.name) > 0) return

      const firstErrorItem = items.find(item => getErrorCount(item.name) > 0)
      if (firstErrorItem && firstErrorItem.name !== activeKey.value) {
        activeKey.value = firstErrorItem.name
      }
    })

    return () => h(ElTabs, {
      'modelValue': activeKey.value,
      'onUpdate:modelValue': (k: string) => { activeKey.value = k },
    }, () => items.map(item => {
      const errorCount = getErrorCount(item.name)

      const tabLabel = errorCount > 0
        ? h('span', { style: 'display: inline-flex; align-items: center; gap: 4px' }, [
            item.title,
            h(ElBadge, { value: errorCount, type: 'danger' }),
          ])
        : item.title

      return h(ElTabPane, { key: item.name, name: item.name }, {
        default: () => h(RecursionField, {
          schema: item.schema,
          name: item.name,
          basePath: field.path,
          onlyRenderProperties: true,
        }),
        label: () => tabLabel,
      })
    }))
  },
})
