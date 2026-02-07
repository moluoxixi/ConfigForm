import type { PropType } from 'vue'
import { ElTabPane, ElTabs } from 'element-plus'
import { defineComponent, h } from 'vue'

/** Tabs 布局容器适配 */
export const LayoutTabs = defineComponent({
  name: 'CfLayoutTabs',
  props: {
    activeKey: { type: String, default: undefined },
    items: { type: Array as PropType<Array<{ key: string; label: string }>>, default: () => [] },
  },
  emits: ['update:activeKey'],
  setup(props, { slots, emit }) {
    return () => h(ElTabs, {
      'modelValue': props.activeKey,
      'onUpdate:modelValue': (k: string) => emit('update:activeKey', k),
    }, () => props.items.map(item =>
      h(ElTabPane, { key: item.key, name: item.key, label: item.label }, () => slots[item.key]?.()),
    ))
  },
})
