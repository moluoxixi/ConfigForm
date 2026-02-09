import type { PropType } from 'vue'
import { ElDatePicker } from 'element-plus'
import { defineComponent, h } from 'vue'

/**
 * 日期范围选择器适配
 *
 * 封装 Element Plus 的 DatePicker（type=daterange）组件，
 * modelValue 为 [startDate, endDate] 数组。
 */
export const DateRangePicker = defineComponent({
  name: 'CfDateRangePicker',
  props: {
    modelValue: { type: Array as PropType<[string, string] | null>, default: null },
    /** 日期范围选择类型 */
    type: {
      type: String as PropType<'daterange' | 'datetimerange' | 'monthrange'>,
      default: 'daterange',
    },
    placeholder: String,
    /** 起始日期占位符 */
    startPlaceholder: { type: String, default: '开始日期' },
    /** 结束日期占位符 */
    endPlaceholder: { type: String, default: '结束日期' },
    /** 日期格式 */
    format: { type: String, default: 'YYYY-MM-DD' },
    /** 值格式 */
    valueFormat: { type: String, default: 'YYYY-MM-DD' },
    /** 范围分隔符 */
    rangeSeparator: { type: String, default: '至' },
    disabled: Boolean,
    readonly: Boolean,
    /** 是否可清空 */
    clearable: { type: Boolean, default: true },
    /** 不可选日期函数 */
    disabledDate: { type: Function as PropType<(date: Date) => boolean>, default: undefined },
  },
  emits: ['update:modelValue', 'focus', 'blur'],
  setup(props, { emit }) {
    return () => {
      /* readonly 模式 */
      if (props.readonly) {
        if (!props.modelValue || props.modelValue.length !== 2) {
          return h('span', null, '—')
        }
        return h('span', null, `${props.modelValue[0]} ${props.rangeSeparator} ${props.modelValue[1]}`)
      }

      const pickerProps: Record<string, unknown> = {
        'modelValue': props.modelValue,
        'type': props.type,
        'startPlaceholder': props.startPlaceholder,
        'endPlaceholder': props.endPlaceholder,
        'format': props.format,
        'valueFormat': props.valueFormat,
        'rangeSeparator': props.rangeSeparator,
        'disabled': props.disabled,
        'clearable': props.clearable,
        'style': 'width: 100%',
        'onUpdate:modelValue': (v: unknown) => emit('update:modelValue', v),
        'onFocus': () => emit('focus'),
        'onBlur': () => emit('blur'),
      }

      if (props.disabledDate) {
        pickerProps.disabledDate = props.disabledDate
      }

      return h(ElDatePicker, pickerProps)
    }
  },
})
