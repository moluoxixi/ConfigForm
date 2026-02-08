import type { FormInstance } from '@moluoxixi/core'
import type { InjectionKey } from 'vue'
import { ElButton } from 'element-plus'
import { defineComponent, h, inject } from 'vue'

/** 表单注入 key（从 @moluoxixi/vue 的 context 中复制，避免循环依赖） */
const FormSymbol: InjectionKey<FormInstance> = Symbol.for('ConfigForm') as unknown as InjectionKey<FormInstance>

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
  },
  emits: ['submit', 'submitFailed', 'reset'],
  setup(props, { emit }) {
    const form = inject(FormSymbol, null)

    const handleSubmit = async (): Promise<void> => {
      if (!form) return
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

    return () => h('div', { style: 'margin-top: 16px; display: flex; gap: 8px' }, [
      props.showSubmit ? h(ElButton, { type: 'primary', onClick: handleSubmit }, () => props.submitLabel) : null,
      props.showReset ? h(ElButton, { onClick: handleReset }, () => props.resetLabel) : null,
    ])
  },
})
