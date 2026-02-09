import type { DataSourceItem } from '@moluoxixi/shared'
import type { PropType } from 'vue'
import { ElCascader } from 'element-plus'
import { defineComponent, h } from 'vue'

/**
 * 级联选择器适配
 *
 * 封装 Element Plus 的 Cascader 组件，
 * 自动对接 ConfigForm 的 dataSource 格式。
 *
 * dataSource 需包含 children 嵌套结构。
 */
export const Cascader = defineComponent({
  name: 'CfCascader',
  props: {
    modelValue: { type: Array as PropType<unknown[]>, default: undefined },
    dataSource: { type: Array as PropType<DataSourceItem[]>, default: () => [] },
    placeholder: String,
    disabled: Boolean,
    readonly: Boolean,
    loading: Boolean,
    /** 是否支持选择任意层级 */
    checkStrictly: Boolean,
    /** 是否可搜索 */
    filterable: Boolean,
    /** 是否支持多选 */
    multiple: Boolean,
    /** 是否展示完整路径标签 */
    showAllLevels: { type: Boolean, default: true },
    /** 分隔符 */
    separator: { type: String, default: ' / ' },
  },
  emits: ['update:modelValue', 'focus', 'blur'],
  setup(props, { emit }) {
    /**
     * 将 DataSourceItem 转为 Element Plus Cascader 要求的 options 格式。
     * DataSourceItem.children → CascaderOption.children（递归）
     */
    const transformOptions = (items: DataSourceItem[]): Record<string, unknown>[] => {
      return items.map(item => ({
        label: item.label,
        value: item.value,
        disabled: item.disabled,
        children: item.children ? transformOptions(item.children) : undefined,
      }))
    }

    /** 从 dataSource 中递归查找 value 对应的 label 路径 */
    const findLabelPath = (items: DataSourceItem[], values: unknown[]): string[] => {
      const labels: string[] = []
      let current = items
      for (const val of values) {
        const found = current.find(item => item.value === val)
        if (!found) break
        labels.push(found.label)
        current = found.children ?? []
      }
      return labels
    }

    return () => {
      /* readonly 模式：显示选中路径文本 */
      if (props.readonly) {
        if (!props.modelValue || props.modelValue.length === 0) {
          return h('span', null, '—')
        }
        const labels = findLabelPath(props.dataSource, props.modelValue)
        return h('span', null, labels.join(props.separator))
      }

      return h(ElCascader, {
        'modelValue': props.modelValue,
        'options': transformOptions(props.dataSource),
        'placeholder': props.placeholder,
        'disabled': props.disabled,
        'filterable': props.filterable,
        'showAllLevels': props.showAllLevels,
        'separator': props.separator,
        'props': {
          checkStrictly: props.checkStrictly,
          multiple: props.multiple,
        },
        'style': 'width: 100%',
        'onUpdate:modelValue': (v: unknown) => emit('update:modelValue', v),
        'onFocus': () => emit('focus'),
        'onBlur': () => emit('blur'),
      })
    }
  },
})
