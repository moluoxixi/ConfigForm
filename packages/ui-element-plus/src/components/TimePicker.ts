import { ElTimePicker } from 'element-plus'
import { defineComponent, h } from 'vue'

export const TimePicker = defineComponent({
  name: 'CfTimePicker',
  props: {
    modelValue: { type: String, default: undefined },
    placeholder: String,
    disabled: Boolean,
    readonly: Boolean,
    format: { type: String, default: 'HH:mm:ss' },
  },
  emits: ['update:modelValue', 'focus', 'blur'],
  setup(props, { emit }) {
    return () => h(ElTimePicker, {
      'modelValue': props.modelValue,
      'format': props.format,
      'placeholder': props.placeholder,
      'disabled': props.disabled,
      'onUpdate:modelValue': (v: string) => emit('update:modelValue', v),
      'onFocus': () => emit('focus'),
      'onBlur': () => emit('blur'),
    })
  },
})
