import type { DataSourceItem } from '@moluoxixi/core'
import { Transfer as ATransfer } from 'ant-design-vue'
import { defineComponent, h, computed } from 'vue'
import type { PropType } from 'vue'

export const Transfer = defineComponent({
  name: 'CfTransfer',
  props: {
    modelValue: { type: Array as PropType<string[]>, default: () => [] },
    dataSource: { type: Array as PropType<DataSourceItem[]>, default: () => [] },
    disabled: Boolean,
    readonly: Boolean,
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const transferData = computed(() =>
      props.dataSource.map(item => ({
        key: String(item.value),
        title: item.label,
      })),
    )
    return () => h(ATransfer, {
      'dataSource': transferData.value,
      'targetKeys': props.modelValue,
      'disabled': props.disabled,
      'render': (item: { title: string }) => item.title,
      'onUpdate:targetKeys': (keys: string[]) => emit('update:modelValue', keys),
    })
  },
})
