import type { PropType } from 'vue'
import { ElInput } from 'element-plus'
import { defineComponent, h } from 'vue'

/** 选项数据结构 */
interface MentionOption {
  label: string
  value: string | number
}

/**
 * 提及输入适配（降级实现）
 *
 * Element Plus 不提供 Mentions 组件，
 * 此处使用 ElInput（textarea 模式）作为降级替代。
 * 功能上仅保留文本输入能力，不支持 @ 提及弹出候选列表。
 * readonly 模式下显示纯文本。
 */
export const Mentions = defineComponent({
  name: 'CfMentions',
  props: {
    modelValue: { type: String, default: '' },
    placeholder: String,
    disabled: Boolean,
    readonly: Boolean,
    /** 候选数据源（降级实现中未使用，保留以兼容接口） */
    dataSource: {
      type: Array as PropType<MentionOption[]>,
      /**
       * 功能：处理参数消化、状态变更与调用链行为同步。
       * @returns 返回当前分支执行后的处理结果。
       */
      default: () => [],
    },
    /** 触发字符前缀（降级实现中未使用，保留以兼容接口） */
    prefix: { type: String, default: '@' },
    /** 文本域行数 */
    rows: { type: Number, default: 3 },
  },
  emits: ['update:modelValue', 'focus', 'blur'],
  /**
   * 功能：处理参数消化、状态变更与调用链行为同步。
   * @param props 参数 props 为当前功能所需的输入信息。
   * @returns 返回当前分支执行后的处理结果。
   */
  setup(props, { emit }) {
    return () => {
      /* readonly 模式显示纯文本 */
      if (props.readonly) {
        return h('span', { style: 'white-space: pre-wrap' }, props.modelValue || '—')
      }

      return h(ElInput, {
        'modelValue': props.modelValue,
        'placeholder': props.placeholder ?? `输入 ${props.prefix} 提及用户`,
        'disabled': props.disabled,
        'type': 'textarea',
        'rows': props.rows,
        /**
         * 功能：处理参数消化、状态变更与调用链行为同步。
         * @param v 参数 v 为当前功能所需的输入信息。
         * @returns 返回当前分支执行后的处理结果。
         */
        'onUpdate:modelValue': (v: string) => emit('update:modelValue', v),
        /**
         * 功能：处理参数消化、状态变更与调用链行为同步。
         * @returns 返回当前分支执行后的处理结果。
         */
        'onFocus': () => emit('focus'),
        /**
         * 功能：处理参数消化、状态变更与调用链行为同步。
         * @returns 返回当前分支执行后的处理结果。
         */
        'onBlur': () => emit('blur'),
      })
    }
  },
})
