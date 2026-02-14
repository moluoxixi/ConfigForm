import type { DataSourceItem } from '@moluoxixi/core'
import type { PropType } from 'vue'
import { Cascader as ACascader } from 'ant-design-vue'
import { computed, defineComponent, h } from 'vue'

function toOptions(items: DataSourceItem[]): any[] {
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
      'value': props.modelValue as any,
      'options': options.value as any,
      'placeholder': props.placeholder,
      'disabled': props.disabled,
      'onUpdate:value': (v: unknown) => emit('update:modelValue', (v ?? []) as (string | number)[]),
      'onFocus': () => emit('focus'),
      'onBlur': () => emit('blur'),
    })
  },
})
