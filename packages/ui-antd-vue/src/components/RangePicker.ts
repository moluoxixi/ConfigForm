import type { PropType } from 'vue'
import { DatePicker as ADatePicker } from 'ant-design-vue'
import { defineComponent, h } from 'vue'

/** 范围日期选择器的底层组件引用 */
const ARangePicker = ADatePicker.RangePicker as any

/** 日期范围选择适配 — 桥接 modelValue([string, string]) + format */
export const RangePicker = defineComponent({
  name: 'CfRangePicker',
  props: {
    modelValue: { type: Array as unknown as PropType<[string, string] | null>, default: null },
    placeholder: { type: Array as unknown as PropType<[string, string]>, default: undefined },
    disabled: Boolean,
    readonly: Boolean,
    /** 日期格式，默认 YYYY-MM-DD */
    format: { type: String, default: 'YYYY-MM-DD' },
  },
  emits: ['update:modelValue', 'focus', 'blur'],
  setup(props, { emit }) {
    return () => {
      return h(ARangePicker, {
        'value': props.modelValue,
        'placeholder': props.placeholder,
        'disabled': props.disabled,
        'format': props.format,
        'valueFormat': props.format,
        'style': 'width: 100%',
        'onUpdate:value': (v: unknown) => emit('update:modelValue', (v as [string, string] | null) ?? null),
        'onFocus': () => emit('focus'),
        'onBlur': () => emit('blur'),
      })
    }
  },
})
