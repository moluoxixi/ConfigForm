import type { DataSourceItem } from '@moluoxixi/core'
import type { PropType } from 'vue'
import { Cascader as ACascader } from 'ant-design-vue'
import { computed, defineComponent, h } from 'vue'

/**
 * to Options：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 to Options 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
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
