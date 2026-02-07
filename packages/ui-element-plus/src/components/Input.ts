import { ElInput } from 'element-plus'
import { defineComponent, h } from 'vue'

/**
 * 输入框组件适配
 */
export const Input = defineComponent({
  name: 'CfInput',
  props: {
    modelValue: { type: [String, Number], default: '' },
    placeholder: String,
    disabled: Boolean,
    readonly: Boolean,
    type: { type: String, default: 'text' },
  },
  emits: ['update:modelValue', 'focus', 'blur'],
  setup(props, { emit }) {
    return () => h(ElInput, {
      'modelValue': String(props.modelValue ?? ''),
      'placeholder': props.placeholder,
      'disabled': props.disabled,
      'readonly': props.readonly,
      'type': props.type,
      'onUpdate:modelValue': (v: string) => emit('update:modelValue', v),
      'onFocus': () => emit('focus'),
      'onBlur': () => emit('blur'),
    })
  },
})
