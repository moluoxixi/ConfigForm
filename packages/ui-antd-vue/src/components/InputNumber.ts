import { InputNumber as AInputNumber } from 'ant-design-vue'
import { defineComponent, h } from 'vue'

/** 数字输入适配 */
export const InputNumber = defineComponent({
  name: 'CfInputNumber',
  props: { modelValue: { type: Number, default: undefined }, placeholder: String, disabled: Boolean, readonly: Boolean, min: Number, max: Number, step: { type: Number, default: 1 } },
  emits: ['update:modelValue', 'focus', 'blur'],
  setup(props, { emit }) {
    return () => {
      if (props.readonly) {
        return h('span', null, props.modelValue !== undefined ? String(props.modelValue) : '—')
      }
      return h(AInputNumber, {
        'value': props.modelValue,
        'placeholder': props.placeholder,
        'disabled': props.disabled,
        'min': props.min,
        'max': props.max,
        'step': props.step,
        'style': 'width: 100%',
        'onUpdate:value': (v: number) => emit('update:modelValue', v),
        'onFocus': () => emit('focus'),
        'onBlur': () => emit('blur'),
      })
    }
  },
})
