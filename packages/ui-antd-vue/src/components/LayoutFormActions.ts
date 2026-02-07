import { Button as AButton } from 'ant-design-vue'
import { defineComponent, h } from 'vue'

/** 表单操作按钮（提交 + 重置） */
export const LayoutFormActions = defineComponent({
  name: 'CfLayoutFormActions',
  props: {
    showSubmit: { type: Boolean, default: true },
    showReset: { type: Boolean, default: true },
    submitLabel: { type: String, default: '提交' },
    resetLabel: { type: String, default: '重置' },
  },
  emits: ['reset'],
  setup(props, { emit }) {
    return () => h('div', { style: 'margin-top: 16px; display: flex; gap: 8px' }, [
      props.showSubmit ? h(AButton, { type: 'primary', htmlType: 'submit' }, () => props.submitLabel) : null,
      props.showReset ? h(AButton, { onClick: () => emit('reset') }, () => props.resetLabel) : null,
    ])
  },
})
