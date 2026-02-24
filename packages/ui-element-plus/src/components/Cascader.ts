import type { DataSourceItem } from '@moluoxixi/core'
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
    dataSource: { type: Array as PropType<DataSourceItem[]>, /**
                                                              * default：执行当前位置的功能逻辑。
                                                              * 定位：`packages/ui-element-plus/src/components/Cascader.ts:18`。
                                                              * 功能：处理参数消化、状态变更与调用链行为同步。
                                                              * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
                                                              * @returns 返回当前分支执行后的处理结果。
                                                              */
      /**
       * default：执行当前位置的功能逻辑。
       * 定位：`packages/ui-element-plus/src/components/Cascader.ts:25`。
       * 功能：处理参数消化、状态变更与调用链行为同步。
       * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
       * @returns 返回当前分支执行后的处理结果。
       */
      default: () => [] },
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
  /**
   * setup：执行当前位置的功能逻辑。
   * 定位：`packages/ui-element-plus/src/components/Cascader.ts:35`。
   * 功能：处理参数消化、状态变更与调用链行为同步。
   * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
   * @param props 参数 props 为当前功能所需的输入信息。
   * @returns 返回当前分支执行后的处理结果。
   */
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
        if (!found)
          break
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
        /**
         * onUpdate:modelValue：执行当前位置的功能逻辑。
         * 定位：`packages/ui-element-plus/src/components/Cascader.ts:86`。
         * 功能：处理参数消化、状态变更与调用链行为同步。
         * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
         * @param v 参数 v 为当前功能所需的输入信息。
         * @returns 返回当前分支执行后的处理结果。
         */
        'onUpdate:modelValue': (v: unknown) => emit('update:modelValue', v),
        /**
         * onFocus：执行当前位置的功能逻辑。
         * 定位：`packages/ui-element-plus/src/components/Cascader.ts:87`。
         * 功能：处理参数消化、状态变更与调用链行为同步。
         * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
         * @returns 返回当前分支执行后的处理结果。
         */
        'onFocus': () => emit('focus'),
        /**
         * onBlur：执行当前位置的功能逻辑。
         * 定位：`packages/ui-element-plus/src/components/Cascader.ts:88`。
         * 功能：处理参数消化、状态变更与调用链行为同步。
         * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
         * @returns 返回当前分支执行后的处理结果。
         */
        'onBlur': () => emit('blur'),
      })
    }
  },
})
