import { ElInputNumber } from 'element-plus'
import { defineComponent, h } from 'vue'

const InputNumberComponent = ElInputNumber as any

/** 数字输入框适配 — readonly 显示纯文本，清空时传 undefined */
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
      if (props.readonly) {
        return h('span', null, props.modelValue ?? '—')
      }
      const { style, ...restAttrs } = attrs
      return h(InputNumberComponent, {
        ...restAttrs,
        'modelValue': props.modelValue,
        'placeholder': props.placeholder,
        'disabled': props.disabled,
        'min': props.min,
        'max': props.max,
        'step': props.step,
        'precision': props.precision,
        'formatter': props.formatter,
        'parser': props.parser,
        'controls': props.controls,
        'style': style ?? 'width: 100%',
        'controlsPosition': 'right',
        /**
         * 功能：处理参数消化、状态变更与调用链行为同步。
         * @param v 参数 v 为当前功能所需的输入信息。
         * @returns 返回当前分支执行后的处理结果。
         */
        'onUpdate:modelValue': (v: unknown) => emit('update:modelValue', v == null ? undefined : Number(v)),
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
      }, {
        prefix: props.prefix ? () => h('span', null, props.prefix) : undefined,
      })
    }
  },
})
