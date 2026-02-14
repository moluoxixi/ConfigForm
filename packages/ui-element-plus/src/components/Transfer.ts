import type { DataSourceItem } from '@moluoxixi/core'
import type { PropType } from 'vue'
import { ElTransfer } from 'element-plus'
import { defineComponent, h } from 'vue'

const TransferComponent = ElTransfer as any

/**
 * 穿梭框数据项（Element Plus Transfer 要求的格式）
 */
interface TransferDataItem {
  key: string | number
  label: string
  disabled?: boolean
}

/**
 * 穿梭框适配
 *
 * 封装 Element Plus 的 Transfer 组件，
 * 自动对接 ConfigForm 的 dataSource 格式。
 *
 * modelValue 为选中项的 value 数组（右侧列表）。
 */
export const Transfer = defineComponent({
  name: 'CfTransfer',
  props: {
    modelValue: { type: Array as PropType<Array<string | number>>, default: () => [] },
    dataSource: { type: Array as PropType<DataSourceItem[]>, default: () => [] },
    disabled: Boolean,
    readonly: Boolean,
    /** 是否可搜索 */
    filterable: Boolean,
    /** 搜索占位符 */
    filterPlaceholder: { type: String, default: '请输入搜索内容' },
    /** 标题（[左标题, 右标题]） */
    titles: { type: Array as unknown as PropType<[string, string]>, default: () => ['待选', '已选'] as [string, string] },
    /** 按钮文案 */
    buttonTexts: { type: Array as unknown as PropType<[string, string]>, default: () => ['', ''] as [string, string] },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    /**
     * 将 DataSourceItem 转为 Transfer 的 data 格式
     */
    const transformData = (items: DataSourceItem[]): TransferDataItem[] => {
      return items.map(item => ({
        key: item.value as string | number,
        label: item.label,
        disabled: item.disabled,
      }))
    }

    return () => {
      /* readonly 模式：显示已选项 */
      if (props.readonly) {
        if (!props.modelValue || props.modelValue.length === 0) {
          return h('span', null, '—')
        }
        const labels = props.modelValue
          .map(v => props.dataSource.find(item => item.value === v)?.label ?? String(v))
          .join('、')
        return h('span', null, labels)
      }

      return h(TransferComponent, {
        'modelValue': props.modelValue,
        'data': transformData(props.dataSource),
        'filterable': props.filterable,
        'filterPlaceholder': props.filterPlaceholder,
        'titles': props.titles as [string, string],
        'buttonTexts': props.buttonTexts as [string, string],
        'disabled': props.disabled,
        'onUpdate:modelValue': (v: unknown) => emit('update:modelValue', Array.isArray(v) ? v : []),
      })
    }
  },
})
