import type { PropType } from 'vue'
import { ElDatePicker } from 'element-plus'
import { defineComponent, h } from 'vue'

/**
 * 年份选择器适配
 *
 * 封装 Element Plus 的 ElDatePicker（type="year"）组件。
 * readonly 模式下显示年份文本。
 */
export const YearPicker = defineComponent({
  name: 'CfYearPicker',
  props: {
    modelValue: { type: String, default: '' },
    placeholder: { type: String, default: '请选择年份' },
    disabled: Boolean,
    readonly: Boolean,
    style: { type: Object as PropType<Record<string, unknown> | undefined>, default: undefined },
    /** 值格式 */
    valueFormat: { type: String, default: 'YYYY' },
    /** 显示格式 */
    format: { type: String, default: 'YYYY' },
  },
  emits: ['update:modelValue', 'focus', 'blur'],
  /**
   * setup：执行当前位置的功能逻辑。
   * 定位：`packages/ui-element-plus/src/components/YearPicker.ts:25`。
   * 功能：处理参数消化、状态变更与调用链行为同步。
   * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
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
        'type': 'year',
        'placeholder': props.placeholder,
        'disabled': props.disabled,
        'valueFormat': props.valueFormat,
        'format': props.format,
        'style': { width: '100%', ...(props.style ?? {}) },
        /**
         * onUpdate:modelValue：执行当前位置的功能逻辑。
         * 定位：`packages/ui-element-plus/src/components/YearPicker.ts:40`。
         * 功能：处理参数消化、状态变更与调用链行为同步。
         * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
         * @param v 参数 v 为当前功能所需的输入信息。
         * @returns 返回当前分支执行后的处理结果。
         */
        'onUpdate:modelValue': (v: string) => emit('update:modelValue', v),
        /**
         * onFocus：执行当前位置的功能逻辑。
         * 定位：`packages/ui-element-plus/src/components/YearPicker.ts:41`。
         * 功能：处理参数消化、状态变更与调用链行为同步。
         * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
         * @returns 返回当前分支执行后的处理结果。
         */
        'onFocus': () => emit('focus'),
        /**
         * onBlur：执行当前位置的功能逻辑。
         * 定位：`packages/ui-element-plus/src/components/YearPicker.ts:42`。
         * 功能：处理参数消化、状态变更与调用链行为同步。
         * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
         * @returns 返回当前分支执行后的处理结果。
         */
        'onBlur': () => emit('blur'),
      })
    }
  },
})
