import { Button as AButton, Step as AStep, Steps as ASteps } from 'ant-design-vue'
import { useField, useSchemaItems, RecursionField } from '@moluoxixi/vue'
import { defineComponent, h, ref } from 'vue'

/**
 * 分步布局容器（Schema 感知模式）
 *
 * 使用框架层 useSchemaItems() 发现步骤面板，
 * 一次只显示当前步骤，自动渲染上一步/下一步按钮。
 */
export const LayoutSteps = defineComponent({
  name: 'CfLayoutSteps',
  setup() {
    const field = useField()
    const items = useSchemaItems()
    const current = ref(0)

    return () => h('div', null, [
      /* 步骤导航 */
      h(ASteps, { current: current.value, style: 'margin-bottom: 24px' }, () =>
        items.map(item => h(AStep, { title: item.title })),
      ),
      /* 步骤内容 */
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
      /* 上一步/下一步按钮 */
      h('div', { style: 'margin-top: 16px; display: flex; gap: 8px' }, [
        current.value > 0
          ? h(AButton, { onClick: () => { current.value-- } }, () => '上一步')
          : null,
        current.value < items.length - 1
          ? h(AButton, { type: 'primary', onClick: () => { current.value++ } }, () => '下一步')
          : null,
      ]),
    ])
  },
})
