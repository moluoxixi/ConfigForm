import type { DataSourceItem } from '@moluoxixi/shared'
import type { PropType } from 'vue'
import { Checkbox as ACheckbox } from 'ant-design-vue'
import { defineComponent, h } from 'vue'

/** 多选组适配 */
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
      return h(ACheckbox.Group, {
        'value': props.modelValue,
        'disabled': props.disabled,
        'options': props.dataSource.map(item => ({ label: item.label, value: item.value })),
        'onUpdate:value': (v: unknown) => emit('update:modelValue', v),
      })
    }
  },
})
