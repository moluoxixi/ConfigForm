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
      default: () => [],
    },
    /** 是否在输入时触发搜索过滤 */
    triggerOnFocus: { type: Boolean, default: true },
    /** 是否可清空 */
    clearable: { type: Boolean, default: true },
  },
  emits: ['update:modelValue', 'focus', 'blur'],
  setup(props, { emit }) {
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
        'onUpdate:modelValue': (v: string | number) => emit('update:modelValue', String(v)),
        'onFocus': () => emit('focus'),
        'onBlur': () => emit('blur'),
      })
    }
  },
})
