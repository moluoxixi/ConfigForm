import { ElInputNumber } from 'element-plus'
import { defineComponent, h } from 'vue'

const InputNumberComponent = ElInputNumber as any

/** 数字输入框适配 — readonly 显示纯文本，清空时传 undefined */
export const InputNumber = defineComponent({
  name: 'CfInputNumber',
  props: { modelValue: { type: Number, default: undefined }, placeholder: String, disabled: Boolean, readonly: Boolean, min: Number, max: Number, step: { type: Number, default: 1 } },
  emits: ['update:modelValue', 'focus', 'blur'],
  setup(props, { emit }) {
    return () => {
      if (props.readonly) {
        return h('span', null, props.modelValue ?? '—')
      }
      return h(InputNumberComponent, {
        'modelValue': props.modelValue,
        'placeholder': props.placeholder,
        'disabled': props.disabled,
        'min': props.min,
        'max': props.max,
        'step': props.step,
        'style': 'width: 100%',
        'controlsPosition': 'right',
        'onUpdate:modelValue': (v: unknown) => emit('update:modelValue', v == null ? undefined : Number(v)),
        'onFocus': () => emit('focus'),
        'onBlur': () => emit('blur'),
      })
    }
  },
})
