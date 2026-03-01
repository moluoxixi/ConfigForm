import type { DataSourceItem } from '@moluoxixi/core'
import type { PropType } from 'vue'
import { Checkbox as ACheckbox } from 'ant-design-vue'
import { defineComponent, h } from 'vue'

/** 多选组适配 */
export const CheckboxGroup = defineComponent({
  name: 'CfCheckboxGroup',
  props: {
    modelValue: { type: Array as PropType<unknown[]>, /**
                                                       * 功能：处理参数消化、状态变更与调用链行为同步。
                                                       * @returns 返回当前分支执行后的处理结果。
                                                       */
      /**
       * 功能：处理参数消化、状态变更与调用链行为同步。
       * @returns 返回当前分支执行后的处理结果。
       */
      default: () => [] },
    dataSource: { type: Array as PropType<DataSourceItem[]>, /**
                                                              * 功能：处理参数消化、状态变更与调用链行为同步。
                                                              * @returns 返回当前分支执行后的处理结果。
                                                              */
      /**
       * 功能：处理参数消化、状态变更与调用链行为同步。
       * @returns 返回当前分支执行后的处理结果。
       */
      default: () => [] },
    disabled: Boolean,
    readonly: Boolean,
  },
  emits: ['update:modelValue'],
  /**
   * 功能：处理参数消化、状态变更与调用链行为同步。
   * @param props 参数 props 为当前功能所需的输入信息。
   * @returns 返回当前分支执行后的处理结果。
   */
  setup(props, { emit }) {
    return () => {
      return h(ACheckbox.Group, {
        'value': props.modelValue as any,
        'disabled': props.disabled,
        'options': props.dataSource.map(item => ({ label: item.label, value: item.value })) as any,
        /**
         * 功能：处理参数消化、状态变更与调用链行为同步。
         * @param v 参数 v 为当前功能所需的输入信息。
         * @returns 返回当前分支执行后的处理结果。
         */
        'onUpdate:value': (v: unknown) => emit('update:modelValue', v),
      })
    }
  },
})
