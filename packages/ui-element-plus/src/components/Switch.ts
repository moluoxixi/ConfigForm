import { ElSwitch } from 'element-plus'
import { defineComponent, h } from 'vue'

/**
 * 开关组件适配
 */
export const Switch = defineComponent({
  name: 'CfSwitch',
  props: { modelValue: { type: Boolean, default: false }, disabled: Boolean, readonly: Boolean },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () => h(ElSwitch, {
      'modelValue': props.modelValue,
      'disabled': props.disabled || props.readonly,
      'onUpdate:modelValue': (v: boolean) => emit('update:modelValue', v),
    })
  },
})
