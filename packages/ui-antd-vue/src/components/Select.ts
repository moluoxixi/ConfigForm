import type { DataSourceItem } from '@moluoxixi/core'
import type { PropType } from 'vue'
import { Select as ASelect } from 'ant-design-vue'
import { defineComponent, h } from 'vue'

const SelectComponent = ASelect as any

/** 下拉选择适配 */
export const Select = defineComponent({
  name: 'CfSelect',
  props: {
    modelValue: { type: [String, Number, Array], default: undefined },
    dataSource: { type: Array as PropType<DataSourceItem[]>, /**
                                                              * default：处理当前分支的交互与状态同步。
                                                              * 功能：处理参数消化、状态变更与调用链行为同步。
                                                              * @returns 返回当前分支执行后的处理结果。
                                                              */
      /**
       * default：处理当前分支的交互与状态同步。
       * 功能：处理参数消化、状态变更与调用链行为同步。
       * @returns 返回当前分支执行后的处理结果。
       */
      default: () => [] },
    placeholder: String,
    disabled: Boolean,
    readonly: Boolean,
    loading: Boolean,
    mode: String as PropType<'multiple' | 'tags'>,
  },
  emits: ['update:modelValue', 'focus', 'blur'],
  /**
   * setup：处理当前分支的交互与状态同步。
   * 功能：处理参数消化、状态变更与调用链行为同步。
   * @param props 参数 props 为当前功能所需的输入信息。
   * @returns 返回当前分支执行后的处理结果。
   */
  setup(props, { emit }) {
    return () => {
      return h(SelectComponent, {
        'value': props.modelValue,
        'placeholder': props.placeholder,
        'disabled': props.disabled,
        'loading': props.loading,
        'mode': props.mode,
        'style': 'width: 100%',
        'options': props.dataSource.map(item => ({ label: item.label, value: item.value, disabled: item.disabled })),
        /**
         * onUpdate:value：处理当前分支的交互与状态同步。
         * 功能：处理参数消化、状态变更与调用链行为同步。
         * @param v 参数 v 为当前功能所需的输入信息。
         * @returns 返回当前分支执行后的处理结果。
         */
        'onUpdate:value': (v: unknown) => emit('update:modelValue', v),
        /**
         * onFocus：处理当前分支的交互与状态同步。
         * 功能：处理参数消化、状态变更与调用链行为同步。
         * @returns 返回当前分支执行后的处理结果。
         */
        'onFocus': () => emit('focus'),
        /**
         * onBlur：处理当前分支的交互与状态同步。
         * 功能：处理参数消化、状态变更与调用链行为同步。
         * @returns 返回当前分支执行后的处理结果。
         */
        'onBlur': () => emit('blur'),
      })
    }
  },
})
