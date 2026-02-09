import { ElButton, ElStep, ElSteps } from 'element-plus'
import { useField, useForm, useSchemaItems, RecursionField } from '@moluoxixi/vue'
import { defineComponent, h, ref, watch } from 'vue'

/**
 * 分步布局容器（Element Plus）
 *
 * 功能：
 * - 每个步骤显示验证错误状态（status="error"）
 * - 提交失败时自动跳转到第一个有错误的步骤
 */
export const LayoutSteps = defineComponent({
  name: 'CfLayoutSteps',
  setup() {
    const field = useField()
    const form = useForm()
    const items = useSchemaItems()
    const current = ref(0)

    const getErrorCount = (itemName: string): number => {
      const prefix = `${field.path}.${itemName}`
      return form.errors.filter(
        e => e.path === prefix || e.path.startsWith(`${prefix}.`),
      ).length
    }

    watch(() => form.errors.length, () => {
      if (form.errors.length === 0) return
      const currentItem = items[current.value]
      if (currentItem && getErrorCount(currentItem.name) > 0) return

      const firstErrorIndex = items.findIndex(item => getErrorCount(item.name) > 0)
      if (firstErrorIndex >= 0 && firstErrorIndex !== current.value) {
        current.value = firstErrorIndex
      }
    })

    return () => h('div', null, [
      h(ElSteps, { active: current.value, style: 'margin-bottom: 24px' }, () =>
        items.map(item => h(ElStep, {
          title: item.title,
          status: getErrorCount(item.name) > 0 ? 'error' : undefined,
        })),
      ),
      ...items.map((item, index) =>
        h('div', { key: item.name, style: { display: index === current.value ? 'block' : 'none' } },
          h(RecursionField, {
            schema: item.schema,
            name: item.name,
            basePath: field.path,
            onlyRenderProperties: true,
          }),
        ),
      ),
      h('div', { style: 'margin-top: 16px; display: flex; gap: 8px' }, [
        current.value > 0
          ? h(ElButton, { onClick: () => { current.value-- } }, () => '上一步')
          : null,
        current.value < items.length - 1
          ? h(ElButton, { type: 'primary', onClick: () => { current.value++ } }, () => '下一步')
          : null,
      ]),
    ])
  },
})
