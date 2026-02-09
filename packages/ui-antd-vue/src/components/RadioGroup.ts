import type { DataSourceItem } from '@moluoxixi/core'
import type { PropType } from 'vue'
import { Radio as ARadio } from 'ant-design-vue'
import { defineComponent, h } from 'vue'

/** 单选组适配 */
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
      return h(ARadio.Group, {
        'value': props.modelValue,
        'disabled': props.disabled,
        'options': props.dataSource.map(item => ({ label: item.label, value: item.value })),
        'onUpdate:value': (v: unknown) => emit('update:modelValue', v),
      })
    }
  },
})
