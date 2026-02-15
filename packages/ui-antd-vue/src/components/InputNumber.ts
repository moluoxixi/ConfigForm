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
        'onUpdate:value': (v: unknown) => emit('update:modelValue', v == null ? undefined : Number(v)),
        'onFocus': () => emit('focus'),
        'onBlur': () => emit('blur'),
      })
    }
  },
})
