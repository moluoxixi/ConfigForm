import type { PropType } from 'vue'
import { Card as ACard } from 'ant-design-vue'
import { defineComponent, h } from 'vue'

/** Card 布局容器适配 */
export const LayoutCard = defineComponent({
  name: 'CfLayoutCard',
  props: {
    title: String,
    size: { type: String as PropType<'default' | 'small'>, default: 'small' },
  },
  setup(props, { slots }) {
    return () => h(ACard, { title: props.title, size: props.size, style: 'margin-bottom: 16px' }, () => slots.default?.())
  },
})
