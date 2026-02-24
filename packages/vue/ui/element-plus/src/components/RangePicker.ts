import type { PropType } from 'vue'
import { ElDatePicker } from 'element-plus'
import { defineComponent, h } from 'vue'

/**
 * 日期范围选择器适配（简化版）
 *
 * 封装 Element Plus 的 ElDatePicker（type="daterange"）组件。
 * 与 DateRangePicker 的区别：RangePicker 提供更简洁的 API，
 * 对标 antd 的 RangePicker 接口。
 * readonly 模式下显示日期范围文本。
 */
export const RangePicker = defineComponent({
  name: 'CfRangePicker',
  props: {
    modelValue: {
      type: Array as unknown as PropType<[string, string] | null>,
      default: null,
    },
    placeholder: {
      type: Array as unknown as PropType<[string, string]>,
      default: undefined,
    },
    /** 起始日期占位符 */
    startPlaceholder: { type: String, default: '开始日期' },
    /** 结束日期占位符 */
    endPlaceholder: { type: String, default: '结束日期' },
    disabled: Boolean,
    readonly: Boolean,
    style: { type: Object as PropType<Record<string, unknown> | undefined>, default: undefined },
    /** 日期显示格式 */
    format: { type: String, default: 'YYYY-MM-DD' },
    /** 值格式 */
    valueFormat: { type: String, default: 'YYYY-MM-DD' },
    /** 范围分隔符 */
    rangeSeparator: { type: String, default: '至' },
    /** 是否可清空 */
    clearable: { type: Boolean, default: true },
  },
  emits: ['update:modelValue', 'focus', 'blur'],
  /**
   * setup：处理当前分支的交互与状态同步。
   * 功能：处理参数消化、状态变更与调用链行为同步。
   * @param props 参数 props 为当前功能所需的输入信息。
   * @returns 返回当前分支执行后的处理结果。
   */
  setup(props, { emit }) {
    return () => {
      /* readonly 模式显示纯文本 */
      if (props.readonly) {
        if (!props.modelValue || props.modelValue.length !== 2) {
          return h('span', null, '—')
        }
        return h('span', null, `${props.modelValue[0]} ${props.rangeSeparator} ${props.modelValue[1]}`)
      }

      /* 如果传了 placeholder 数组，拆为 startPlaceholder / endPlaceholder */
      const startPh = props.placeholder?.[0] ?? props.startPlaceholder
      const endPh = props.placeholder?.[1] ?? props.endPlaceholder

      return h(ElDatePicker, {
        'modelValue': props.modelValue,
        'type': 'daterange',
        'startPlaceholder': startPh,
        'endPlaceholder': endPh,
        'format': props.format,
        'valueFormat': props.valueFormat,
        'rangeSeparator': props.rangeSeparator,
        'disabled': props.disabled,
        'clearable': props.clearable,
        'style': { width: '100%', ...(props.style ?? {}) },
        /**
         * onUpdate:modelValue：处理当前分支的交互与状态同步。
         * 功能：处理参数消化、状态变更与调用链行为同步。
         * @param v 参数 v 为当前功能所需的输入信息。
         * @returns 返回当前分支执行后的处理结果。
         */
        'onUpdate:modelValue': (v: unknown) => emit('update:modelValue', v),
        /**
         * onFocus：处理当前分支的交互与状态同步。
         * 功能：处理参数消化、状态变更与调用链行为同步。
         * @returns 返回当前分支执行后的处理结果。
         */
        'onFocus': () => emit('focus'),
        /**
         * onBlur：处理当前分支的交互与状态同步。
         * 功能：处理参数消化、状态变更与调用链行为同步。
         * @returns 返回当前分支执行后的处理结果。
         */
        'onBlur': () => emit('blur'),
      })
    }
  },
})
