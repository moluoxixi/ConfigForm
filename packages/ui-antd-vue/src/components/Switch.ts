import { Switch as ASwitch } from 'ant-design-vue'
import { defineComponent, h } from 'vue'

/** 开关适配 */
export const Switch = defineComponent({
  name: 'CfSwitch',
  props: { modelValue: { type: Boolean, default: false }, disabled: Boolean, readonly: Boolean },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () => {
      if (props.readonly) {
        return h('span', null, props.modelValue ? '是' : '否')
      }
      return h(ASwitch, {
        'checked': props.modelValue,
        'disabled': props.disabled,
        'onUpdate:checked': (v: boolean) => emit('update:modelValue', v),
      })
    }
  },
})
