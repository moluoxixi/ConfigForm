import type { DataSourceItem } from '@moluoxixi/core'
import type { PropType } from 'vue'
import { ElCheckbox, ElCheckboxGroup } from 'element-plus'
import { defineComponent, h } from 'vue'

/** 复选组适配 — readonly 显示已选标签文本（顿号分隔） */
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
    return () => {
      if (props.readonly) {
        const selectedLabels = (props.modelValue ?? [])
          .map(v => props.dataSource.find(item => item.value === v)?.label ?? String(v))
          .join('、')
        return h('span', null, selectedLabels || '—')
      }
      return h(ElCheckboxGroup, {
        'modelValue': props.modelValue,
        'disabled': props.disabled,
        'onUpdate:modelValue': (v: unknown) => emit('update:modelValue', v),
      }, () => props.dataSource.map(item =>
        h(ElCheckbox, { key: String(item.value), value: item.value }, () => item.label),
      ))
    }
  },
})
