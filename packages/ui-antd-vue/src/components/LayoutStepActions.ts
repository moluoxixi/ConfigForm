import { Button as AButton } from 'ant-design-vue'
import { defineComponent, h } from 'vue'

/** Steps 导航按钮 */
export const LayoutStepActions = defineComponent({
  name: 'CfLayoutStepActions',
  props: {
    current: { type: Number, default: 0 },
    total: { type: Number, default: 1 },
    loading: Boolean,
  },
  emits: ['prev', 'next'],
  setup(props, { emit }) {
    return () => h('div', { style: 'display: flex; justify-content: space-between; margin-top: 16px' }, [
      h('div', null, props.current > 0 ? h(AButton, { onClick: () => emit('prev') }, () => '上一步') : null),
      props.current < props.total - 1 ? h(AButton, { type: 'primary', loading: props.loading, onClick: () => emit('next') }, () => '下一步') : null,
    ])
  },
})
