import type { DataSourceItem } from '@moluoxixi/core'
import type { PropType } from 'vue'
import { ElOption, ElSelect } from 'element-plus'
import { defineComponent, h } from 'vue'

/** 选择器适配 — readonly 显示已选标签文本 */
export const Select = defineComponent({
  name: 'CfSelect',
  props: {
    modelValue: { type: [String, Number, Array], default: undefined },
    dataSource: { type: Array as PropType<DataSourceItem[]>, default: () => [] },
    placeholder: String,
    disabled: Boolean,
    readonly: Boolean,
    loading: Boolean,
    multiple: Boolean,
  },
  emits: ['update:modelValue', 'focus', 'blur'],
  setup(props, { emit }) {
    return () => {
      if (props.readonly) {
        if (props.multiple && Array.isArray(props.modelValue)) {
          const labels = props.modelValue
            .map(v => props.dataSource.find(item => item.value === v)?.label ?? String(v))
            .join('、')
          return h('span', null, labels || '—')
        }
        const selectedLabel = props.dataSource.find(item => item.value === props.modelValue)?.label
        return h('span', null, selectedLabel ?? String(props.modelValue ?? '—'))
      }
      return h(ElSelect, {
        'modelValue': props.modelValue,
        'placeholder': props.placeholder,
        'disabled': props.disabled,
        'loading': props.loading,
        'multiple': props.multiple,
        'style': 'width: 100%',
        'onUpdate:modelValue': (v: unknown) => emit('update:modelValue', v),
        'onFocus': () => emit('focus'),
        'onBlur': () => emit('blur'),
      }, () => props.dataSource.map(item =>
        h(ElOption, {
          key: String(item.value),
          label: item.label,
          value: item.value,
          disabled: item.disabled,
        }),
      ))
    }
  },
})
