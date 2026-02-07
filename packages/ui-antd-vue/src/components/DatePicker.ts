import { DatePicker as ADatePicker } from 'ant-design-vue'
import { defineComponent, h } from 'vue'

/** 日期选择适配 */
export const DatePicker = defineComponent({
  name: 'CfDatePicker',
  props: { modelValue: { type: String, default: '' }, placeholder: String, disabled: Boolean, readonly: Boolean },
  emits: ['update:modelValue', 'focus', 'blur'],
  setup(props, { emit }) {
    return () => {
      return h(ADatePicker, {
        'value': props.modelValue,
        'placeholder': props.placeholder,
        'disabled': props.disabled,
        'style': 'width: 100%',
        'valueFormat': 'YYYY-MM-DD',
        'onUpdate:value': (v: string) => emit('update:modelValue', v),
      })
    }
  },
})
