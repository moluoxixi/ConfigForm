import type { PropType } from 'vue'
import { ElCollapse, ElCollapseItem } from 'element-plus'
import { defineComponent, h } from 'vue'

/** Collapse 布局容器适配 */
export const LayoutCollapse = defineComponent({
  name: 'CfLayoutCollapse',
  props: {
    activeKey: { type: Array as PropType<string[]>, default: undefined },
    items: { type: Array as PropType<Array<{ key: string; label: string }>>, default: () => [] },
  },
  emits: ['update:activeKey'],
  setup(props, { slots, emit }) {
    return () => h(ElCollapse, {
      'modelValue': props.activeKey,
      'onUpdate:modelValue': (keys: string[]) => emit('update:activeKey', keys),
    }, () => props.items.map(item =>
      h(ElCollapseItem, { key: item.key, name: item.key, title: item.label }, () => slots[item.key]?.()),
    ))
  },
})
