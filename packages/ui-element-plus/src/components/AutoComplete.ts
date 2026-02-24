import type { PropType } from 'vue'
import { ElAutocomplete } from 'element-plus'
import { defineComponent, h } from 'vue'

/** 选项数据结构 */
interface AutoCompleteOption {
  label: string
  value: string | number
}

/**
 * 自动补全输入适配
 *
 * 封装 Element Plus 的 ElAutocomplete 组件，
 * 通过 dataSource 提供候选项列表，内部转换为 fetchSuggestions 回调。
 * readonly 模式下显示纯文本。
 */
export const AutoComplete = defineComponent({
  name: 'CfAutoComplete',
  props: {
    modelValue: { type: String, default: '' },
    placeholder: String,
    disabled: Boolean,
    readonly: Boolean,
    /** 候选数据源 */
    dataSource: {
      type: Array as PropType<AutoCompleteOption[]>,
      /**
       * default：执行当前功能逻辑。
       *
       * @returns 返回当前功能的处理结果。
       */

      default: () => [],
    },
    /** 是否在输入时触发搜索过滤 */
    triggerOnFocus: { type: Boolean, default: true },
    /** 是否可清空 */
    clearable: { type: Boolean, default: true },
  },
  emits: ['update:modelValue', 'focus', 'blur'],
  /**
   * setup：当前功能模块的核心执行单元。
   * 所属模块：`packages/ui-element-plus/src/components/AutoComplete.ts`。
   * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
   * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
   * @param props 参数 `props`用于提供当前函数执行所需的输入信息。
   * @param context 组件上下文对象。
   * @param context.emit 组件事件派发函数。
   * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
   */
  setup(props, context) {
    const { emit } = context
    /**
     * 将 dataSource 数组转换为 ElAutocomplete 所需的 fetchSuggestions 回调
     *
     * @param queryString - 用户当前输入的文本
     * @param cb - 回调函数，传入过滤后的候选项
     */
    function fetchSuggestions(
      queryString: string,
      cb: (suggestions: Array<{ value: string, label: string }>) => void,
    ): void {
      const suggestions = props.dataSource.map(item => ({
        value: String(item.value),
        label: item.label,
      }))

      /* 根据输入文本过滤候选项（不区分大小写） */
      if (queryString) {
        const keyword = queryString.toLowerCase()
        cb(suggestions.filter(s =>
          s.value.toLowerCase().includes(keyword)
          || s.label.toLowerCase().includes(keyword),
        ))
      }
      else {
        cb(suggestions)
      }
    }

    return () => {
      /* readonly 模式显示纯文本 */
      if (props.readonly) {
        return h('span', null, props.modelValue || '—')
      }

      return h(ElAutocomplete, {
        'modelValue': props.modelValue,
        'placeholder': props.placeholder,
        'disabled': props.disabled,
        'fetchSuggestions': fetchSuggestions,
        'triggerOnFocus': props.triggerOnFocus,
        'clearable': props.clearable,
        'style': 'width: 100%',
        /**
         * onUpdate:modelValue：执行当前功能逻辑。
         *
         * @param v 参数 v 的输入说明。
         *
         * @returns 返回当前功能的处理结果。
         */

        'onUpdate:modelValue': (v: string | number) => emit('update:modelValue', String(v)),
        /**
         * onFocus：执行当前功能逻辑。
         *
         * @returns 返回当前功能的处理结果。
         */

        'onFocus': () => emit('focus'),
        /**
         * onBlur：执行当前功能逻辑。
         *
         * @returns 返回当前功能的处理结果。
         */

        'onBlur': () => emit('blur'),
      })
    }
  },
})
