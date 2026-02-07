import type { DataSourceItem } from '@moluoxixi/shared'
import type { PropType } from 'vue'
import { ElRadio, ElRadioGroup } from 'element-plus'
import { defineComponent, h } from 'vue'

/**
 * 单选框组组件适配
 */
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
    return () => h(ElRadioGroup, {
      'modelValue': props.modelValue,
      'disabled': props.disabled || props.readonly,
      'onUpdate:modelValue': (v: unknown) => emit('update:modelValue', v),
    }, () => props.dataSource.map(item =>
      h(ElRadio, { key: String(item.value), value: item.value }, () => item.label),
    ))
  },
})
