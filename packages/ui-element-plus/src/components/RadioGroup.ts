import type { DataSourceItem } from '@moluoxixi/core'
import type { PropType } from 'vue'
import { ElRadio, ElRadioGroup } from 'element-plus'
import { defineComponent, h } from 'vue'

/** 单选组适配 — readonly 显示已选标签文本 */
export const RadioGroup = defineComponent({
  name: 'CfRadioGroup',
  props: {
    modelValue: { type: [String, Number, Boolean], default: undefined },
    dataSource: { type: Array as PropType<DataSourceItem[]>, default: () => [] },
    disabled: Boolean,
    readonly: Boolean,
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () => {
      if (props.readonly) {
        const selectedLabel = props.dataSource.find(item => item.value === props.modelValue)?.label
        return h('span', null, selectedLabel ?? String(props.modelValue ?? '—'))
      }
      return h(ElRadioGroup, {
        'modelValue': props.modelValue,
        'disabled': props.disabled,
        'onUpdate:modelValue': (v: unknown) => emit('update:modelValue', v),
      }, () => props.dataSource.map(item =>
        h(ElRadio, { key: String(item.value), value: item.value }, () => item.label),
      ))
    }
  },
})
