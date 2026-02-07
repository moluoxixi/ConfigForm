import { InputPassword as AInputPassword } from 'ant-design-vue'
import { defineComponent, h } from 'vue'

/** 密码输入适配 */
export const Password = defineComponent({
  name: 'CfPassword',
  props: { modelValue: { type: String, default: '' }, placeholder: String, disabled: Boolean, readonly: Boolean },
  emits: ['update:modelValue', 'focus', 'blur'],
  setup(props, { emit }) {
    return () => {
      if (props.readonly) {
        return h('span', null, props.modelValue ? '••••••••' : '—')
      }
      return h(AInputPassword, {
        'value': props.modelValue,
        'placeholder': props.placeholder,
        'disabled': props.disabled,
        'onUpdate:value': (v: string) => emit('update:modelValue', v),
        'onFocus': () => emit('focus'),
        'onBlur': () => emit('blur'),
      })
    }
  },
})
