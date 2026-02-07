import { ElInput } from 'element-plus'
import { defineComponent, h } from 'vue'

/** 文本域适配 — readonly 显示纯文本保留换行 */
export const Textarea = defineComponent({
  name: 'CfTextarea',
  props: { modelValue: { type: String, default: '' }, placeholder: String, disabled: Boolean, readonly: Boolean, rows: { type: Number, default: 3 } },
  emits: ['update:modelValue', 'focus', 'blur'],
  setup(props, { emit }) {
    return () => {
      if (props.readonly) {
        return h('span', { style: 'white-space: pre-wrap' }, props.modelValue || '—')
      }
      return h(ElInput, {
        'modelValue': props.modelValue,
        'placeholder': props.placeholder,
        'disabled': props.disabled,
        'type': 'textarea',
        'rows': props.rows,
        'onUpdate:modelValue': (v: string) => emit('update:modelValue', v),
        'onFocus': () => emit('focus'),
        'onBlur': () => emit('blur'),
      })
    }
  },
})
