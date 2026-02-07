import { ElSwitch } from 'element-plus'
import { defineComponent, h } from 'vue'

/** 开关适配 — readonly 显示"是/否"文本 */
export const Switch = defineComponent({
  name: 'CfSwitch',
  props: { modelValue: { type: Boolean, default: false }, disabled: Boolean, readonly: Boolean },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () => {
      if (props.readonly) {
        return h('span', null, props.modelValue ? '是' : '否')
      }
      return h(ElSwitch, {
        'modelValue': props.modelValue,
        'disabled': props.disabled,
        'onUpdate:modelValue': (v: boolean) => emit('update:modelValue', v),
      })
    }
  },
})
