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
        'onUpdate:modelValue': (v: unknown) => emit('update:modelValue', v == null ? undefined : Number(v)),
        'onFocus': () => emit('focus'),
        'onBlur': () => emit('blur'),
      }, {
        prefix: props.prefix ? () => h('span', null, props.prefix) : undefined,
      })
    }
  },
})
