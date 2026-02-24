import type { PropType } from 'vue'
import { Input as AInput } from 'ant-design-vue'
import { defineComponent, h } from 'vue'

/** 文本输入适配 — 桥接 modelValue + readonly 纯文本 */
export const Input = defineComponent({
  name: 'CfInput',
  props: {
    modelValue: { type: [String, Number], default: '' },
    placeholder: String,
    disabled: Boolean,
    readonly: Boolean,
    style: { type: Object as PropType<Record<string, unknown> | undefined>, default: undefined },
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
      return h(AInput, {
        'value': props.modelValue,
        'placeholder': props.placeholder,
        'disabled': props.disabled,
        'style': { width: '100%', ...(props.style ?? {}) },
        /**
         * onUpdate:value：处理当前分支的交互与状态同步。
         * 功能：处理参数消化、状态变更与调用链行为同步。
         * @param v 参数 v 为当前功能所需的输入信息。
         * @returns 返回当前分支执行后的处理结果。
         */
        'onUpdate:value': (v: string) => emit('update:modelValue', v),
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
