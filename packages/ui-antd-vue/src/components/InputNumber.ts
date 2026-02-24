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
   * setup：执行当前位置的功能逻辑。
   * 定位：`packages/ui-antd-vue/src/components/InputNumber.ts:26`。
   * 功能：处理参数消化、状态变更与调用链行为同步。
   * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
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
         * onUpdate:value：执行当前位置的功能逻辑。
         * 定位：`packages/ui-antd-vue/src/components/InputNumber.ts:43`。
         * 功能：处理参数消化、状态变更与调用链行为同步。
         * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
         * @param v 参数 v 为当前功能所需的输入信息。
         * @returns 返回当前分支执行后的处理结果。
         */
        'onUpdate:value': (v: unknown) => emit('update:modelValue', v == null ? undefined : Number(v)),
        /**
         * onFocus：执行当前位置的功能逻辑。
         * 定位：`packages/ui-antd-vue/src/components/InputNumber.ts:44`。
         * 功能：处理参数消化、状态变更与调用链行为同步。
         * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
         * @returns 返回当前分支执行后的处理结果。
         */
        'onFocus': () => emit('focus'),
        /**
         * onBlur：执行当前位置的功能逻辑。
         * 定位：`packages/ui-antd-vue/src/components/InputNumber.ts:45`。
         * 功能：处理参数消化、状态变更与调用链行为同步。
         * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
         * @returns 返回当前分支执行后的处理结果。
         */
        'onBlur': () => emit('blur'),
      })
    }
  },
})
