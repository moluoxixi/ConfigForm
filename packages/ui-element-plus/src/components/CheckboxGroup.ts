import type { DataSourceItem } from '@moluoxixi/core'
import type { PropType } from 'vue'
import { ElCheckbox, ElCheckboxGroup } from 'element-plus'
import { defineComponent, h } from 'vue'

/** 复选组适配 — readonly 显示已选标签文本（顿号分隔） */
export const CheckboxGroup = defineComponent({
  name: 'CfCheckboxGroup',
  props: {
    modelValue: { type: Array as PropType<unknown[]>, /**
                                                       * default：执行当前位置的功能逻辑。
                                                       * 定位：`packages/ui-element-plus/src/components/CheckboxGroup.ts:10`。
                                                       * 功能：处理参数消化、状态变更与调用链行为同步。
                                                       * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
                                                       * @returns 返回当前分支执行后的处理结果。
                                                       */
      /**
       * default：执行当前位置的功能逻辑。
       * 定位：`packages/ui-element-plus/src/components/CheckboxGroup.ts:17`。
       * 功能：处理参数消化、状态变更与调用链行为同步。
       * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
       * @returns 返回当前分支执行后的处理结果。
       */
      default: () => [] },
    dataSource: { type: Array as PropType<DataSourceItem[]>, /**
                                                              * default：执行当前位置的功能逻辑。
                                                              * 定位：`packages/ui-element-plus/src/components/CheckboxGroup.ts:11`。
                                                              * 功能：处理参数消化、状态变更与调用链行为同步。
                                                              * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
                                                              * @returns 返回当前分支执行后的处理结果。
                                                              */
      /**
       * default：执行当前位置的功能逻辑。
       * 定位：`packages/ui-element-plus/src/components/CheckboxGroup.ts:25`。
       * 功能：处理参数消化、状态变更与调用链行为同步。
       * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
       * @returns 返回当前分支执行后的处理结果。
       */
      default: () => [] },
    disabled: Boolean,
    readonly: Boolean,
  },
  emits: ['update:modelValue'],
  /**
   * setup：执行当前位置的功能逻辑。
   * 定位：`packages/ui-element-plus/src/components/CheckboxGroup.ts:16`。
   * 功能：处理参数消化、状态变更与调用链行为同步。
   * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
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
         * onUpdate:modelValue：执行当前位置的功能逻辑。
         * 定位：`packages/ui-element-plus/src/components/CheckboxGroup.ts:27`。
         * 功能：处理参数消化、状态变更与调用链行为同步。
         * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
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
