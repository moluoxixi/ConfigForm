import type { DataSourceItem } from '@moluoxixi/core'
import type { PropType } from 'vue'
import { Mentions as AMentions } from 'ant-design-vue'
import { computed, defineComponent, h } from 'vue'

/** 提及输入适配 — 桥接 modelValue + dataSource + prefix 触发字符 */
export const Mentions = defineComponent({
  name: 'CfMentions',
  props: {
    modelValue: { type: String, default: '' },
    dataSource: { type: Array as PropType<DataSourceItem[]>, /**
                                                              * 功能：处理参数消化、状态变更与调用链行为同步。
                                                              * @returns 返回当前分支执行后的处理结果。
                                                              */
      /**
       * 功能：处理参数消化、状态变更与调用链行为同步。
       * @returns 返回当前分支执行后的处理结果。
       */
      default: () => [] },
    placeholder: String,
    disabled: Boolean,
    readonly: Boolean,
    /** 触发字符，默认 @ */
    prefix: { type: String, default: '@' },
  },
  emits: ['update:modelValue', 'focus', 'blur'],
  /**
   * 功能：处理参数消化、状态变更与调用链行为同步。
   * @param props 参数 props 为当前功能所需的输入信息。
   * @returns 返回当前分支执行后的处理结果。
   */
  setup(props, { emit }) {
    /** 将 DataSourceItem[] 转为 ant-design-vue Mentions 的 options 格式 */
    const options = computed(() =>
      props.dataSource.map(item => ({ value: String(item.value), label: item.label })),
    )

    return () => {
      return h(AMentions, {
        'value': props.modelValue,
        'placeholder': props.placeholder,
        'disabled': props.disabled,
        'options': options.value,
        'prefix': props.prefix,
        /**
         * 功能：处理参数消化、状态变更与调用链行为同步。
         * @param v 参数 v 为当前功能所需的输入信息。
         * @returns 返回当前分支执行后的处理结果。
         */
        'onUpdate:value': (v: string) => emit('update:modelValue', v),
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
