import { ElDatePicker } from 'element-plus'
import { defineComponent, h } from 'vue'

/**
 * 月份选择器适配
 *
 * 封装 Element Plus 的 ElDatePicker（type="month"）组件。
 * readonly 模式下显示月份文本。
 */
export const MonthPicker = defineComponent({
  name: 'CfMonthPicker',
  props: {
    modelValue: { type: String, default: '' },
    placeholder: { type: String, default: '请选择月份' },
    disabled: Boolean,
    readonly: Boolean,
    /** 值格式 */
    valueFormat: { type: String, default: 'YYYY-MM' },
    /** 显示格式 */
    format: { type: String, default: 'YYYY-MM' },
  },
  emits: ['update:modelValue', 'focus', 'blur'],
  setup(props, { emit }) {
    return () => {
      /* readonly 模式显示纯文本 */
      if (props.readonly) {
        return h('span', null, props.modelValue || '—')
      }

      return h(ElDatePicker, {
        'modelValue': props.modelValue,
        'type': 'month',
        'placeholder': props.placeholder,
        'disabled': props.disabled,
        'valueFormat': props.valueFormat,
        'format': props.format,
        'style': 'width: 100%',
        'onUpdate:modelValue': (v: string) => emit('update:modelValue', v),
        'onFocus': () => emit('focus'),
        'onBlur': () => emit('blur'),
      })
    }
  },
})
