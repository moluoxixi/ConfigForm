import { InputNumber as AInputNumber } from 'ant-design-vue'
import { defineComponent, h } from 'vue'

const InputNumberComponent = AInputNumber as any

/** 数字输入适配 */
export const InputNumber = defineComponent({
  name: 'CfInputNumber',
  props: { modelValue: { type: Number, default: undefined }, placeholder: String, disabled: Boolean, readonly: Boolean, min: Number, max: Number, step: { type: Number, default: 1 } },
  emits: ['update:modelValue', 'focus', 'blur'],
  setup(props, { emit }) {
    return () => {
      return h(InputNumberComponent, {
        'value': props.modelValue,
        'placeholder': props.placeholder,
        'disabled': props.disabled,
        'min': props.min,
        'max': props.max,
        'step': props.step,
        'style': 'width: 100%',
        'onUpdate:value': (v: unknown) => emit('update:modelValue', v == null ? undefined : Number(v)),
        'onFocus': () => emit('focus'),
        'onBlur': () => emit('blur'),
      })
    }
  },
})
