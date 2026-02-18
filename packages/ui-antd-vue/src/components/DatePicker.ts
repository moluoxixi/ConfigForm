import { DatePicker as ADatePicker } from 'ant-design-vue'
import type { PropType } from 'vue'
import { defineComponent, h } from 'vue'

const DatePickerComponent = ADatePicker as any

/** 日期选择适配 */
export const DatePicker = defineComponent({
  name: 'CfDatePicker',
  props: {
    modelValue: { type: String, default: '' },
    placeholder: String,
    disabled: Boolean,
    readonly: Boolean,
    style: { type: Object as PropType<Record<string, unknown> | undefined>, default: undefined },
  },
  emits: ['update:modelValue', 'focus', 'blur'],
  setup(props, { emit }) {
    return () => {
      return h(DatePickerComponent, {
        'value': props.modelValue,
        'placeholder': props.placeholder,
        'disabled': props.disabled,
        'style': { width: '100%', ...(props.style ?? {}) },
        'valueFormat': 'YYYY-MM-DD',
        'onUpdate:value': (v: unknown) => emit('update:modelValue', String(v ?? '')),
      })
    }
  },
})
