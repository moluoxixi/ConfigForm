import type { DataSourceItem } from '@moluoxixi/shared'
import type { PropType } from 'vue'
import { ElCheckbox, ElCheckboxGroup } from 'element-plus'
import { defineComponent, h } from 'vue'

/**
 * 复选框组组件适配
 */
export const CheckboxGroup = defineComponent({
  name: 'CfCheckboxGroup',
  props: {
    modelValue: { type: Array as PropType<unknown[]>, default: () => [] },
    dataSource: { type: Array as PropType<DataSourceItem[]>, default: () => [] },
    disabled: Boolean,
    readonly: Boolean,
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () => h(ElCheckboxGroup, {
      'modelValue': props.modelValue,
      'disabled': props.disabled || props.readonly,
      'onUpdate:modelValue': (v: unknown) => emit('update:modelValue', v),
    }, () => props.dataSource.map(item =>
      h(ElCheckbox, { key: String(item.value), value: item.value }, () => item.label),
    ))
  },
})
