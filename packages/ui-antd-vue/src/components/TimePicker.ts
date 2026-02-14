import { TimePicker as ATimePicker } from 'ant-design-vue'
import { defineComponent, h } from 'vue'

const TimePickerComponent = ATimePicker as any

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
    return () => h(TimePickerComponent, {
      'value': props.modelValue,
      'valueFormat': 'HH:mm:ss',
      'format': props.format,
      'placeholder': props.placeholder,
      'disabled': props.disabled,
      'onUpdate:value': (v: unknown) => emit('update:modelValue', typeof v === 'string' ? v : ''),
      'onFocus': () => emit('focus'),
      'onBlur': () => emit('blur'),
    })
  },
})
