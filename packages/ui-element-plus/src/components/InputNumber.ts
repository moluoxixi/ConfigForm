import { ElInputNumber } from 'element-plus'
import { defineComponent, h } from 'vue'

/**
 * 数字输入框组件适配
 */
export const InputNumber = defineComponent({
  name: 'CfInputNumber',
  props: { modelValue: { type: Number, default: undefined }, placeholder: String, disabled: Boolean, readonly: Boolean, min: Number, max: Number, step: { type: Number, default: 1 } },
  emits: ['update:modelValue', 'focus', 'blur'],
  setup(props, { emit }) {
    return () => h(ElInputNumber, {
      'modelValue': props.modelValue,
      'placeholder': props.placeholder,
      'disabled': props.disabled || props.readonly,
      'min': props.min,
      'max': props.max,
      'step': props.step,
      'style': 'width: 100%',
      'controlsPosition': 'right',
      'onUpdate:modelValue': (v: number) => emit('update:modelValue', v),
      'onFocus': () => emit('focus'),
      'onBlur': () => emit('blur'),
    })
  },
})
