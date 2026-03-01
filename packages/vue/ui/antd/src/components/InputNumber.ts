import { InputNumber as AInputNumber } from 'ant-design-vue'
import { defineComponent, h } from 'vue'

const InputNumberComponent = AInputNumber as any

/** 数字输入适配 */
export const InputNumber = defineComponent({
  name: 'CfInputNumber',
  inheritAttrs: false,
  props: {
    modelValue: { type: Number, default: undefined },
    placeholder: String,
    disabled: Boolean,
    readonly: Boolean,
    min: Number,
    max: Number,
    step: { type: Number, default: 1 },
    precision: Number,
    formatter: Function,
    parser: Function,
    stringMode: Boolean,
    controls: Boolean,
    prefix: String,
  },
  emits: ['update:modelValue', 'focus', 'blur'],
  /**
   * 功能：处理参数消化、状态变更与调用链行为同步。
   * @param props 参数 props 为当前功能所需的输入信息。
   * @returns 返回当前分支执行后的处理结果。
   */
  setup(props, { emit, attrs }) {
    return () => {
      const { style, ...restAttrs } = attrs
      return h(InputNumberComponent, {
        ...restAttrs,
        'value': props.modelValue,
        'placeholder': props.placeholder,
        'disabled': props.disabled,
        'min': props.min,
        'max': props.max,
        'step': props.step,
        'precision': props.precision,
        'formatter': props.formatter,
        'parser': props.parser,
        'stringMode': props.stringMode,
        'controls': props.controls,
        'style': style ?? 'width: 100%',
        /**
         * 功能：处理参数消化、状态变更与调用链行为同步。
         * @param v 参数 v 为当前功能所需的输入信息。
         * @returns 返回当前分支执行后的处理结果。
         */
        'onUpdate:value': (v: unknown) => emit('update:modelValue', v == null ? undefined : Number(v)),
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
