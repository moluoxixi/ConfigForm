import type { DataSourceItem } from '@moluoxixi/core'
import type { PropType } from 'vue'
import { ElTreeSelect } from 'element-plus'
import { defineComponent, h } from 'vue'

/**
 * 树选择器适配
 *
 * 封装 Element Plus 的 TreeSelect 组件，
 * 自动对接 ConfigForm 的 dataSource（含 children 嵌套结构）。
 */
export const TreeSelect = defineComponent({
  name: 'CfTreeSelect',
  props: {
    modelValue: { type: [String, Number, Array], default: undefined },
    dataSource: { type: Array as PropType<DataSourceItem[]>, default: () => [] },
    placeholder: String,
    disabled: Boolean,
    readonly: Boolean,
    loading: Boolean,
    /** 是否多选 */
    multiple: Boolean,
    /** 是否可搜索 */
    filterable: Boolean,
    /** 选择策略（all / parent / children） */
    checkStrictly: Boolean,
    /** 是否可清空 */
    clearable: { type: Boolean, default: true },
    /** 是否显示复选框 */
    showCheckbox: Boolean,
    /** 是否默认展开所有节点 */
    defaultExpandAll: Boolean,
  },
  emits: ['update:modelValue', 'focus', 'blur'],
  setup(props, { emit }) {
    /**
     * 将 DataSourceItem 转为 Element Plus TreeSelect 的 data 格式
     */
    const transformData = (items: DataSourceItem[]): Record<string, unknown>[] => {
      return items.map(item => ({
        label: item.label,
        value: item.value,
        disabled: item.disabled,
        children: item.children ? transformData(item.children) : undefined,
      }))
    }

    /** 递归查找 label */
    const findLabel = (items: DataSourceItem[], value: unknown): string | undefined => {
      for (const item of items) {
        if (item.value === value) return item.label
        if (item.children) {
          const found = findLabel(item.children, value)
          if (found) return found
        }
      }
      return undefined
    }

    return () => {
      /* readonly 模式 */
      if (props.readonly) {
        if (props.multiple && Array.isArray(props.modelValue)) {
          const labels = (props.modelValue as unknown[])
            .map(v => findLabel(props.dataSource, v) ?? String(v))
            .join('、')
          return h('span', null, labels || '—')
        }
        const label = findLabel(props.dataSource, props.modelValue)
        return h('span', null, label ?? String(props.modelValue ?? '—'))
      }

      return h(ElTreeSelect, {
        'modelValue': props.modelValue,
        'data': transformData(props.dataSource),
        'placeholder': props.placeholder,
        'disabled': props.disabled,
        'multiple': props.multiple,
        'filterable': props.filterable,
        'checkStrictly': props.checkStrictly,
        'clearable': props.clearable,
        'showCheckbox': props.showCheckbox,
        'defaultExpandAll': props.defaultExpandAll,
        'renderAfterExpand': false,
        'style': 'width: 100%',
        'onUpdate:modelValue': (v: unknown) => emit('update:modelValue', v),
        'onFocus': () => emit('focus'),
        'onBlur': () => emit('blur'),
      })
    }
  },
})
