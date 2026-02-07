import type { PropType } from 'vue'
import { ElStep, ElSteps } from 'element-plus'
import { defineComponent, h } from 'vue'

/** Steps 布局适配 */
export const LayoutSteps = defineComponent({
  name: 'CfLayoutSteps',
  props: {
    current: { type: Number, default: 0 },
    items: { type: Array as PropType<Array<{ title: string; description?: string }>>, default: () => [] },
  },
  setup(props) {
    return () => h(ElSteps, {
      active: props.current,
      style: 'margin-bottom: 24px',
    }, () => props.items.map(item =>
      h(ElStep, { title: item.title, description: item.description }),
    ))
  },
})
