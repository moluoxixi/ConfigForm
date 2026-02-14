import { ElSwitch } from 'element-plus'
import { defineComponent, h } from 'vue'

const SwitchComponent = ElSwitch as any

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
      return h(SwitchComponent, {
        'modelValue': props.modelValue,
        'disabled': props.disabled,
        'onUpdate:modelValue': (v: unknown) => emit('update:modelValue', Boolean(v)),
      })
    }
  },
})
