import { ElDatePicker } from 'element-plus'
import { defineComponent, h } from 'vue'

/**
 * 周选择器适配
 *
 * 封装 Element Plus 的 ElDatePicker（type="week"）组件。
 * readonly 模式下显示周文本。
 */
export const WeekPicker = defineComponent({
  name: 'CfWeekPicker',
  props: {
    modelValue: { type: String, default: '' },
    placeholder: { type: String, default: '请选择周' },
    disabled: Boolean,
    readonly: Boolean,
    /** 值格式 */
    valueFormat: { type: String, default: 'YYYY-[W]ww' },
    /** 显示格式 */
    format: { type: String, default: 'YYYY 第 ww 周' },
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
        'type': 'week',
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
