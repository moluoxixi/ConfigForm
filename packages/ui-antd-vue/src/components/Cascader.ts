import type { DataSourceItem } from '@moluoxixi/core'
import { Cascader as ACascader } from 'ant-design-vue'
import { defineComponent, h, computed } from 'vue'
import type { PropType } from 'vue'

function toOptions(items: DataSourceItem[]): unknown[] {
  return items.map(item => ({
    label: item.label,
    value: item.value,
    children: item.children ? toOptions(item.children) : undefined,
  }))
}

export const Cascader = defineComponent({
  name: 'CfCascader',
  props: {
    modelValue: { type: Array as PropType<(string | number)[]>, default: () => [] },
    dataSource: { type: Array as PropType<DataSourceItem[]>, default: () => [] },
    placeholder: String,
    disabled: Boolean,
    readonly: Boolean,
  },
  emits: ['update:modelValue', 'focus', 'blur'],
  setup(props, { emit }) {
    const options = computed(() => toOptions(props.dataSource))
    return () => h(ACascader, {
      'value': props.modelValue,
      'options': options.value,
      'placeholder': props.placeholder,
      'disabled': props.disabled,
      'onUpdate:value': (v: (string | number)[]) => emit('update:modelValue', v),
      'onFocus': () => emit('focus'),
      'onBlur': () => emit('blur'),
    })
  },
})
