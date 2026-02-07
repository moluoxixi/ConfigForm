import { ElDatePicker } from 'element-plus'
import { defineComponent, h } from 'vue'

/**
 * 日期选择器组件适配
 */
export const DatePicker = defineComponent({
  name: 'CfDatePicker',
  props: { modelValue: { type: String, default: '' }, placeholder: String, disabled: Boolean, readonly: Boolean },
  emits: ['update:modelValue', 'focus', 'blur'],
  setup(props, { emit }) {
    return () => h(ElDatePicker, {
      'modelValue': props.modelValue,
      'placeholder': props.placeholder,
      'disabled': props.disabled || props.readonly,
      'style': 'width: 100%',
      'valueFormat': 'YYYY-MM-DD',
      'onUpdate:modelValue': (v: string) => emit('update:modelValue', v),
      'onFocus': () => emit('focus'),
      'onBlur': () => emit('blur'),
    })
  },
})
