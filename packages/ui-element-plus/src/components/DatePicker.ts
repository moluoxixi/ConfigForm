import { ElDatePicker } from 'element-plus'
import { defineComponent, h } from 'vue'

/** 日期选择器适配 — readonly 显示日期文本 */
export const DatePicker = defineComponent({
  name: 'CfDatePicker',
  props: { modelValue: { type: String, default: '' }, placeholder: String, disabled: Boolean, readonly: Boolean },
  emits: ['update:modelValue', 'focus', 'blur'],
  setup(props, { emit }) {
    return () => {
      if (props.readonly) {
        return h('span', null, props.modelValue || '—')
      }
      return h(ElDatePicker, {
        'modelValue': props.modelValue,
        'placeholder': props.placeholder,
        'disabled': props.disabled,
        'style': 'width: 100%',
        'valueFormat': 'YYYY-MM-DD',
        'onUpdate:modelValue': (v: string) => emit('update:modelValue', v),
        'onFocus': () => emit('focus'),
        'onBlur': () => emit('blur'),
      })
    }
  },
})
