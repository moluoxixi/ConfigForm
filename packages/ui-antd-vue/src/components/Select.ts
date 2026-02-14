import type { DataSourceItem } from '@moluoxixi/core'
import type { PropType } from 'vue'
import { Select as ASelect } from 'ant-design-vue'
import { defineComponent, h } from 'vue'

const SelectComponent = ASelect as any

/** 下拉选择适配 */
export const Select = defineComponent({
  name: 'CfSelect',
  props: {
    modelValue: { type: [String, Number, Array], default: undefined },
    dataSource: { type: Array as PropType<DataSourceItem[]>, default: () => [] },
    placeholder: String,
    disabled: Boolean,
    readonly: Boolean,
    loading: Boolean,
    mode: String as PropType<'multiple' | 'tags'>,
  },
  emits: ['update:modelValue', 'focus', 'blur'],
  setup(props, { emit }) {
    return () => {
      return h(SelectComponent, {
        'value': props.modelValue,
        'placeholder': props.placeholder,
        'disabled': props.disabled,
        'loading': props.loading,
        'mode': props.mode,
        'style': 'width: 100%',
        'options': props.dataSource.map(item => ({ label: item.label, value: item.value, disabled: item.disabled })),
        'onUpdate:value': (v: unknown) => emit('update:modelValue', v),
        'onFocus': () => emit('focus'),
        'onBlur': () => emit('blur'),
      })
    }
  },
})
