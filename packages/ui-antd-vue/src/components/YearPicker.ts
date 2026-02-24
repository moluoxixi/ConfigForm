import type { PropType } from 'vue'
import { DatePicker as ADatePicker } from 'ant-design-vue'
import { defineComponent, h } from 'vue'

const DatePickerComponent = ADatePicker as any

/** 年份选择器适配 — 基于 DatePicker picker="year"，值格式 YYYY */
export const YearPicker = defineComponent({
  name: 'CfYearPicker',
  props: {
    modelValue: { type: String, default: '' },
    placeholder: String,
    disabled: Boolean,
    readonly: Boolean,
    style: { type: Object as PropType<Record<string, unknown> | undefined>, default: undefined },
  },
  emits: ['update:modelValue', 'focus', 'blur'],
  /**
   * setup：执行当前位置的功能逻辑。
   * 定位：`packages/ui-antd-vue/src/components/YearPicker.ts:18`。
   * 功能：处理参数消化、状态变更与调用链行为同步。
   * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
   * @param props 参数 props 为当前功能所需的输入信息。
   * @returns 返回当前分支执行后的处理结果。
   */
  setup(props, { emit }) {
    return () => {
      return h(DatePickerComponent, {
        'value': props.modelValue,
        'placeholder': props.placeholder,
        'disabled': props.disabled,
        'picker': 'year',
        'valueFormat': 'YYYY',
        'style': { width: '100%', ...(props.style ?? {}) },
        /**
         * onUpdate:value：执行当前位置的功能逻辑。
         * 定位：`packages/ui-antd-vue/src/components/YearPicker.ts:27`。
         * 功能：处理参数消化、状态变更与调用链行为同步。
         * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
         * @param v 参数 v 为当前功能所需的输入信息。
         * @returns 返回当前分支执行后的处理结果。
         */
        'onUpdate:value': (v: unknown) => emit('update:modelValue', String(v ?? '')),
      })
    }
  },
})
