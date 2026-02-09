import { ElButton, ElStep, ElSteps } from 'element-plus'
import { useField, useSchemaItems, RecursionField } from '@moluoxixi/vue'
import { defineComponent, h, ref } from 'vue'

/**
 * 分步布局容器（Schema 感知模式）
 */
export const LayoutSteps = defineComponent({
  name: 'CfLayoutSteps',
  setup() {
    const field = useField()
    const items = useSchemaItems()
    const current = ref(0)

    return () => h('div', null, [
      h(ElSteps, { active: current.value, style: 'margin-bottom: 24px' }, () =>
        items.map(item => h(ElStep, { title: item.title })),
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
