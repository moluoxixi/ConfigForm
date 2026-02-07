import type { DataSourceItem } from '@moluoxixi/shared'
import type { PropType } from 'vue'
import { ElOption, ElSelect } from 'element-plus'
import { defineComponent, h } from 'vue'

/**
 * 选择器组件适配
 */
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
    return () => h(ElSelect, {
      'modelValue': props.modelValue,
      'placeholder': props.placeholder,
      'disabled': props.disabled || props.readonly,
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
  },
})
