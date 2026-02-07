import type { PropType } from 'vue'
import { ElCard } from 'element-plus'
import { defineComponent, h } from 'vue'

/**
 * Card 布局容器适配
 */
export const LayoutCard = defineComponent({
  name: 'CfLayoutCard',
  props: {
    title: String,
    size: { type: String as PropType<'default' | 'small'>, default: 'small' },
  },
  setup(props, { slots }) {
    return () => h(ElCard, { header: props.title, shadow: 'never', style: 'margin-bottom: 16px' }, () => slots.default?.())
  },
})
