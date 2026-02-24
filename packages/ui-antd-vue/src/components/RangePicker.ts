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
    style: { type: Object as PropType<Record<string, unknown> | undefined>, default: undefined },
    /** 日期格式，默认 YYYY-MM-DD */
    format: { type: String, default: 'YYYY-MM-DD' },
  },
  emits: ['update:modelValue', 'focus', 'blur'],
  /**
   * setup：执行当前位置的功能逻辑。
   * 定位：`packages/ui-antd-vue/src/components/RangePicker.ts:21`。
   * 功能：处理参数消化、状态变更与调用链行为同步。
   * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
   * @param props 参数 props 为当前功能所需的输入信息。
   * @returns 返回当前分支执行后的处理结果。
   */
  setup(props, { emit }) {
    return () => {
      return h(ARangePicker, {
        'value': props.modelValue,
        'placeholder': props.placeholder,
        'disabled': props.disabled,
        'format': props.format,
        'valueFormat': props.format,
        'style': { width: '100%', ...(props.style ?? {}) },
        /**
         * onUpdate:value：执行当前位置的功能逻辑。
         * 定位：`packages/ui-antd-vue/src/components/RangePicker.ts:30`。
         * 功能：处理参数消化、状态变更与调用链行为同步。
         * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
         * @param v 参数 v 为当前功能所需的输入信息。
         * @returns 返回当前分支执行后的处理结果。
         */
        'onUpdate:value': (v: unknown) => emit('update:modelValue', (v as [string, string] | null) ?? null),
        /**
         * onFocus：执行当前位置的功能逻辑。
         * 定位：`packages/ui-antd-vue/src/components/RangePicker.ts:31`。
         * 功能：处理参数消化、状态变更与调用链行为同步。
         * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
         * @returns 返回当前分支执行后的处理结果。
         */
        'onFocus': () => emit('focus'),
        /**
         * onBlur：执行当前位置的功能逻辑。
         * 定位：`packages/ui-antd-vue/src/components/RangePicker.ts:32`。
         * 功能：处理参数消化、状态变更与调用链行为同步。
         * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
         * @returns 返回当前分支执行后的处理结果。
         */
        'onBlur': () => emit('blur'),
      })
    }
  },
})
