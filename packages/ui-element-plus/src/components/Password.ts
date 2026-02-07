import { ElInput } from 'element-plus'
import { defineComponent, h } from 'vue'

/** 密码输入框适配 — readonly 显示掩码文本 */
export const Password = defineComponent({
  name: 'CfPassword',
  props: { modelValue: { type: String, default: '' }, placeholder: String, disabled: Boolean, readonly: Boolean },
  emits: ['update:modelValue', 'focus', 'blur'],
  setup(props, { emit }) {
    return () => {
      if (props.readonly) {
        return h('span', null, props.modelValue ? '••••••••' : '—')
      }
      return h(ElInput, {
        'modelValue': props.modelValue,
        'placeholder': props.placeholder,
        'disabled': props.disabled,
        'type': 'password',
        'showPassword': true,
        'onUpdate:modelValue': (v: string) => emit('update:modelValue', v),
        'onFocus': () => emit('focus'),
        'onBlur': () => emit('blur'),
      })
    }
  },
})
