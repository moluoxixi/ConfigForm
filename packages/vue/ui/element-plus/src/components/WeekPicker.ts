import type { PropType } from 'vue'
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
    style: { type: Object as PropType<Record<string, unknown> | undefined>, default: undefined },
    /** 值格式 */
    valueFormat: { type: String, default: 'YYYY-[W]ww' },
    /** 显示格式 */
    format: { type: String, default: 'YYYY 第 ww 周' },
  },
  emits: ['update:modelValue', 'focus', 'blur'],
  /**
   * 功能：处理参数消化、状态变更与调用链行为同步。
   * @param props 参数 props 为当前功能所需的输入信息。
   * @returns 返回当前分支执行后的处理结果。
   */
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
        'style': { width: '100%', ...(props.style ?? {}) },
        /**
         * 功能：处理参数消化、状态变更与调用链行为同步。
         * @param v 参数 v 为当前功能所需的输入信息。
         * @returns 返回当前分支执行后的处理结果。
         */
        'onUpdate:modelValue': (v: string) => emit('update:modelValue', v),
        /**
         * 功能：处理参数消化、状态变更与调用链行为同步。
         * @returns 返回当前分支执行后的处理结果。
         */
        'onFocus': () => emit('focus'),
        /**
         * 功能：处理参数消化、状态变更与调用链行为同步。
         * @returns 返回当前分支执行后的处理结果。
         */
        'onBlur': () => emit('blur'),
      })
    }
  },
})
