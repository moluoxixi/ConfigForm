import { Textarea as ATextarea } from 'ant-design-vue'
import { defineComponent, h } from 'vue'

/** 多行文本适配 */
export const Textarea = defineComponent({
  name: 'CfTextarea',
  props: { modelValue: { type: String, default: '' }, placeholder: String, disabled: Boolean, readonly: Boolean, rows: { type: Number, default: 3 } },
  emits: ['update:modelValue', 'focus', 'blur'],
  setup(props, { emit }) {
    return () => {
      return h(ATextarea, {
        'value': props.modelValue,
        'placeholder': props.placeholder,
        'disabled': props.disabled,
        'rows': props.rows,
        'onUpdate:value': (v: string) => emit('update:modelValue', v),
        'onFocus': () => emit('focus'),
        'onBlur': () => emit('blur'),
      })
    }
  },
})
