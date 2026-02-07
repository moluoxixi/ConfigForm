import type { PropType } from 'vue'
import { Collapse as ACollapse, CollapsePanel as ACollapsePanel } from 'ant-design-vue'
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
    return () => h(ACollapse, {
      'activeKey': props.activeKey,
      'onUpdate:activeKey': (keys: string[]) => emit('update:activeKey', keys),
    }, () => props.items.map(item =>
      h(ACollapsePanel, { key: item.key, header: item.label }, () => slots[item.key]?.()),
    ))
  },
})
