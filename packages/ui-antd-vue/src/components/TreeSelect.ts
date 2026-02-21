import type { DataSourceItem } from '@moluoxixi/core'
import type { PropType } from 'vue'
import { TreeSelect as ATreeSelect } from 'ant-design-vue'
import { computed, defineComponent, h } from 'vue'

const TreeSelectComponent = ATreeSelect as any

/**
 * to Tree Data：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 to Tree Data 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
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
    return () => h(TreeSelectComponent, {
      'value': props.modelValue,
      'treeData': treeData.value,
      'placeholder': props.placeholder,
      'disabled': props.disabled,
      'multiple': props.multiple,
      'onUpdate:value': (v: unknown) => emit('update:modelValue', v as string | number | (string | number)[]),
      'onFocus': () => emit('focus'),
      'onBlur': () => emit('blur'),
    })
  },
})
