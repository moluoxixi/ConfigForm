import { FormSymbol } from '@moluoxixi/vue'
import { Button as AButton } from 'ant-design-vue'
import { defineComponent, h, inject } from 'vue'

/**
 * 表单操作按钮（提交 + 重置）
 *
 * 参考 Formily Submit/Reset 组件。
 * 自动从上下文获取 form 实例，直接调用 form.submit() / form.reset()。
 * 无需外层包裹 <form> 标签。
 */
export const LayoutFormActions = defineComponent({
  name: 'CfLayoutFormActions',
  props: {
    showSubmit: { type: Boolean, default: true },
    showReset: { type: Boolean, default: true },
    submitLabel: { type: String, default: '提交' },
    resetLabel: { type: String, default: '重置' },
    align: { type: String, default: 'center' },
  },
  emits: ['submit', 'submitFailed', 'reset'],
  setup(props, { emit }) {
    const form = inject(FormSymbol, null)

    const handleSubmit = async (): Promise<void> => {
      if (!form)
        return
      const result = await form.submit()
      if (result.errors.length > 0) {
        emit('submitFailed', result.errors)
      }
      else {
        emit('submit', result.values)
      }
    }

    const handleReset = (): void => {
      if (form) {
        form.reset()
      }
      emit('reset')
    }

    return () => {
      /** preview/disabled 模式下自动隐藏操作按钮 */
      if (form && form.pattern !== 'editable') {
        return null
      }

      const justifyContent = props.align === 'left' ? 'flex-start' : props.align === 'right' ? 'flex-end' : 'center'

      return h('div', { style: `margin-top: 24px; display: flex; justify-content: ${justifyContent}; gap: 8px` }, [
        props.showSubmit ? h(AButton, { type: 'primary', onClick: handleSubmit }, () => props.submitLabel) : null,
        props.showReset ? h(AButton, { onClick: handleReset }, () => props.resetLabel) : null,
      ])
    }
  },
})
