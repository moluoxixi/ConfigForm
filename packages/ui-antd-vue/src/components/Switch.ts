import { Switch as ASwitch } from 'ant-design-vue'
import { defineComponent, h } from 'vue'

const SwitchComponent = ASwitch as any

/** 开关适配 */
export const Switch = defineComponent({
  name: 'CfSwitch',
  props: { modelValue: { type: Boolean, default: false }, disabled: Boolean, readonly: Boolean },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () => {
      return h(SwitchComponent, {
        'checked': props.modelValue,
        'disabled': props.disabled,
        'onUpdate:checked': (v: unknown) => emit('update:modelValue', Boolean(v)),
      })
    }
  },
})
