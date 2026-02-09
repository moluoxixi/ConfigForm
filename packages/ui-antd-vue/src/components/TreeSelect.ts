import type { DataSourceItem } from '@moluoxixi/core'
import { TreeSelect as ATreeSelect } from 'ant-design-vue'
import { defineComponent, h, computed } from 'vue'
import type { PropType } from 'vue'

function toTreeData(items: DataSourceItem[]): unknown[] {
  return items.map(item => ({
    title: item.label,
    value: item.value,
    children: item.children ? toTreeData(item.children) : undefined,
  }))
}

export const TreeSelect = defineComponent({
  name: 'CfTreeSelect',
  props: {
    modelValue: { type: [String, Number, Array] as PropType<string | number | (string | number)[]>, default: undefined },
    dataSource: { type: Array as PropType<DataSourceItem[]>, default: () => [] },
    placeholder: String,
    disabled: Boolean,
    readonly: Boolean,
    multiple: Boolean,
  },
  emits: ['update:modelValue', 'focus', 'blur'],
  setup(props, { emit }) {
    const treeData = computed(() => toTreeData(props.dataSource))
    return () => h(ATreeSelect, {
      'value': props.modelValue,
      'treeData': treeData.value,
      'placeholder': props.placeholder,
      'disabled': props.disabled,
      'multiple': props.multiple,
      'onUpdate:value': (v: string | number | (string | number)[]) => emit('update:modelValue', v),
      'onFocus': () => emit('focus'),
      'onBlur': () => emit('blur'),
    })
  },
})
