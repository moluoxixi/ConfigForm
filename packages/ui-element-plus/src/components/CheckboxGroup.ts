import type { DataSourceItem } from '@moluoxixi/core'
import type { PropType } from 'vue'
import { ElCheckbox, ElCheckboxGroup } from 'element-plus'
import { defineComponent, h } from 'vue'

/** 复选组适配 — readonly 显示已选标签文本（顿号分隔） */
export const CheckboxGroup = defineComponent({
  name: 'CfCheckboxGroup',
  props: {
    modelValue: { type: Array as PropType<unknown[]>, /**
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
    disabled: Boolean,
    readonly: Boolean,
  },
  emits: ['update:modelValue'],
  /**
   * setup：处理当前分支的交互与状态同步。
   * 功能：处理参数消化、状态变更与调用链行为同步。
   * @param props 参数 props 为当前功能所需的输入信息。
   * @returns 返回当前分支执行后的处理结果。
   */
  setup(props, { emit }) {
    return () => {
      if (props.readonly) {
        const selectedLabels = (props.modelValue ?? [])
          .map(v => props.dataSource.find(item => item.value === v)?.label ?? String(v))
          .join('、')
        return h('span', null, selectedLabels || '—')
      }
      return h(ElCheckboxGroup, {
        'modelValue': props.modelValue as any,
        'disabled': props.disabled,
        /**
         * onUpdate:modelValue：处理当前分支的交互与状态同步。
         * 功能：处理参数消化、状态变更与调用链行为同步。
         * @param v 参数 v 为当前功能所需的输入信息。
         * @returns 返回当前分支执行后的处理结果。
         */
        'onUpdate:modelValue': (v: unknown) => emit('update:modelValue', v),
      }, () => props.dataSource.map(item =>
        h(ElCheckbox, { key: String(item.value), value: item.value }, () => item.label),
      ))
    }
  },
})
