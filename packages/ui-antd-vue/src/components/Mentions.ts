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
                                                              * default：执行当前位置的功能逻辑。
                                                              * 定位：`packages/ui-antd-vue/src/components/Mentions.ts:11`。
                                                              * 功能：处理参数消化、状态变更与调用链行为同步。
                                                              * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
                                                              * @returns 返回当前分支执行后的处理结果。
                                                              */
      /**
       * default：执行当前位置的功能逻辑。
       * 定位：`packages/ui-antd-vue/src/components/Mentions.ts:18`。
       * 功能：处理参数消化、状态变更与调用链行为同步。
       * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
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
   * setup：执行当前位置的功能逻辑。
   * 定位：`packages/ui-antd-vue/src/components/Mentions.ts:19`。
   * 功能：处理参数消化、状态变更与调用链行为同步。
   * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
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
         * onUpdate:value：执行当前位置的功能逻辑。
         * 定位：`packages/ui-antd-vue/src/components/Mentions.ts:32`。
         * 功能：处理参数消化、状态变更与调用链行为同步。
         * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
         * @param v 参数 v 为当前功能所需的输入信息。
         * @returns 返回当前分支执行后的处理结果。
         */
        'onUpdate:value': (v: string) => emit('update:modelValue', v),
        /**
         * onFocus：执行当前位置的功能逻辑。
         * 定位：`packages/ui-antd-vue/src/components/Mentions.ts:33`。
         * 功能：处理参数消化、状态变更与调用链行为同步。
         * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
         * @returns 返回当前分支执行后的处理结果。
         */
        'onFocus': () => emit('focus'),
        /**
         * onBlur：执行当前位置的功能逻辑。
         * 定位：`packages/ui-antd-vue/src/components/Mentions.ts:34`。
         * 功能：处理参数消化、状态变更与调用链行为同步。
         * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
         * @returns 返回当前分支执行后的处理结果。
         */
        'onBlur': () => emit('blur'),
      })
    }
  },
})
