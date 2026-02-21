import type { PropType } from 'vue'
import { ElInput } from 'element-plus'
import { defineComponent, h } from 'vue'

/** 文本输入适配 — 桥接 modelValue + readonly 纯文本 */
export const Input = defineComponent({
  name: 'CfInput',
  props: {
    modelValue: { type: [String, Number], default: '' },
    placeholder: String,
    disabled: Boolean,
    readonly: Boolean,
    type: { type: String, default: 'text' },
    style: { type: Object as PropType<Record<string, unknown> | undefined>, default: undefined },
  },
  emits: ['update:modelValue', 'focus', 'blur'],
  setup(props, { emit }) {
    return () => {
      if (props.readonly) {
        return h('span', null, String(props.modelValue || '—'))
      }
      return h(ElInput, {
        'modelValue': String(props.modelValue ?? ''),
        'placeholder': props.placeholder,
        'disabled': props.disabled,
        'type': props.type,
        'style': { width: '100%', ...(props.style ?? {}) },
        'onUpdate:modelValue': (v: string) => emit('update:modelValue', v),
        'onFocus': () => emit('focus'),
        'onBlur': () => emit('blur'),
      })
    }
  },
})
