import type { DataSourceItem } from '@moluoxixi/core'
import type { PropType } from 'vue'
import { Transfer as ATransfer } from 'ant-design-vue'
import { computed, defineComponent, h } from 'vue'

const TransferComponent = ATransfer as any

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
    return () => h(TransferComponent, {
      'dataSource': transferData.value,
      'targetKeys': props.modelValue,
      'disabled': props.disabled,
      'render': (item: { title?: string }) => item.title ?? '',
      'onUpdate:targetKeys': (keys: unknown) => emit('update:modelValue', Array.isArray(keys) ? keys.map(v => String(v)) : []),
    })
  },
})
