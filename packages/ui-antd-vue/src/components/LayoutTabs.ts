import type { PropType } from 'vue'
import { TabPane as ATabPane, Tabs as ATabs } from 'ant-design-vue'
import { defineComponent, h } from 'vue'

/** Tabs 布局容器适配 */
export const LayoutTabs = defineComponent({
  name: 'CfLayoutTabs',
  props: {
    activeKey: { type: String, default: undefined },
    items: { type: Array as PropType<Array<{ key: string, label: string }>>, default: () => [] },
  },
  emits: ['update:activeKey'],
  setup(props, { slots, emit }) {
    return () => h(ATabs, {
      'activeKey': props.activeKey,
      'onUpdate:activeKey': (k: string) => emit('update:activeKey', k),
    }, () => props.items.map(item =>
      h(ATabPane, { key: item.key, tab: item.label }, () => slots[item.key]?.()),
    ))
  },
})
