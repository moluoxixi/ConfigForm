import type { DataSourceItem } from '@moluoxixi/core'
import type { PropType } from 'vue'
import { ElRadio, ElRadioGroup } from 'element-plus'
import { defineComponent, h } from 'vue'

/** 单选组适配 — readonly 显示已选标签文本 */
export const RadioGroup = defineComponent({
  name: 'CfRadioGroup',
  props: {
    modelValue: { type: [String, Number, Boolean], default: undefined },
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
      if (props.readonly) {
        const selectedLabel = props.dataSource.find(item => item.value === props.modelValue)?.label
        return h('span', null, selectedLabel ?? String(props.modelValue ?? '—'))
      }
      return h(ElRadioGroup, {
        'modelValue': props.modelValue,
        'disabled': props.disabled,
        /**
         * 功能：处理参数消化、状态变更与调用链行为同步。
         * @param v 参数 v 为当前功能所需的输入信息。
         * @returns 返回当前分支执行后的处理结果。
         */
        'onUpdate:modelValue': (v: unknown) => emit('update:modelValue', v),
      }, () => props.dataSource.map(item =>
        h(ElRadio, { key: String(item.value), value: item.value }, () => item.label),
      ))
    }
  },
})
