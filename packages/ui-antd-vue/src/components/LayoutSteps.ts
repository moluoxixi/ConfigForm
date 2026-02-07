import type { PropType } from 'vue'
import { Steps as ASteps } from 'ant-design-vue'
import { defineComponent, h } from 'vue'

/** Steps 布局适配 */
export const LayoutSteps = defineComponent({
  name: 'CfLayoutSteps',
  props: {
    current: { type: Number, default: 0 },
    items: { type: Array as PropType<Array<{ title: string, description?: string }>>, default: () => [] },
  },
  setup(props) {
    return () => h(ASteps, { current: props.current, items: props.items, style: 'margin-bottom: 24px' })
  },
})
