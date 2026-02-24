import type { DataSourceItem } from '@moluoxixi/core'
import type { PropType } from 'vue'
import { AutoComplete as AAutoComplete } from 'ant-design-vue'
import { computed, defineComponent, h } from 'vue'

/** 自动完成输入适配 — 桥接 modelValue + dataSource 选项 */
export const AutoComplete = defineComponent({
  name: 'CfAutoComplete',
  props: {
    modelValue: { type: String, default: '' },
    dataSource: { type: Array as PropType<DataSourceItem[]>, /**
                                                              * default：执行当前位置的功能逻辑。
                                                              * 定位：`packages/ui-antd-vue/src/components/AutoComplete.ts:11`。
                                                              * 功能：处理参数消化、状态变更与调用链行为同步。
                                                              * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
                                                              * @returns 返回当前分支执行后的处理结果。
                                                              */
      /**
       * default：执行当前位置的功能逻辑。
       * 定位：`packages/ui-antd-vue/src/components/AutoComplete.ts:18`。
       * 功能：处理参数消化、状态变更与调用链行为同步。
       * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
       * @returns 返回当前分支执行后的处理结果。
       */
      default: () => [] },
    placeholder: String,
    disabled: Boolean,
    readonly: Boolean,
  },
  emits: ['update:modelValue', 'focus', 'blur'],
  /**
   * setup：执行当前位置的功能逻辑。
   * 定位：`packages/ui-antd-vue/src/components/AutoComplete.ts:17`。
   * 功能：处理参数消化、状态变更与调用链行为同步。
   * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
   * @param props 参数 props 为当前功能所需的输入信息。
   * @returns 返回当前分支执行后的处理结果。
   */
  setup(props, { emit }) {
    /** 将 DataSourceItem[] 转为 ant-design-vue AutoComplete 的 options 格式 */
    const options = computed(() =>
      props.dataSource.map(item => ({ value: String(item.value), label: item.label })),
    )

    return () => {
      return h(AAutoComplete as any, {
        'value': props.modelValue,
        'placeholder': props.placeholder,
        'disabled': props.disabled,
        'options': options.value as any,
        'style': 'width: 100%',
        /**
         * onUpdate:value：执行当前位置的功能逻辑。
         * 定位：`packages/ui-antd-vue/src/components/AutoComplete.ts:30`。
         * 功能：处理参数消化、状态变更与调用链行为同步。
         * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
         * @param v 参数 v 为当前功能所需的输入信息。
         * @returns 返回当前分支执行后的处理结果。
         */
        'onUpdate:value': (v: unknown) => emit('update:modelValue', String(v ?? '')),
        /**
         * onFocus：执行当前位置的功能逻辑。
         * 定位：`packages/ui-antd-vue/src/components/AutoComplete.ts:31`。
         * 功能：处理参数消化、状态变更与调用链行为同步。
         * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
         * @returns 返回当前分支执行后的处理结果。
         */
        'onFocus': () => emit('focus'),
        /**
         * onBlur：执行当前位置的功能逻辑。
         * 定位：`packages/ui-antd-vue/src/components/AutoComplete.ts:32`。
         * 功能：处理参数消化、状态变更与调用链行为同步。
         * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
         * @returns 返回当前分支执行后的处理结果。
         */
        'onBlur': () => emit('blur'),
      })
    }
  },
})
