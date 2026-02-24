import type { DataSourceItem } from '@moluoxixi/core'
import type { PropType } from 'vue'
import { Cascader as ACascader } from 'ant-design-vue'
import { computed, defineComponent, h } from 'vue'

/**
 * to Options：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 to Options 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
function toOptions(items: DataSourceItem[]): any[] {
  return items.map(item => ({
    label: item.label,
    value: item.value,
    children: item.children ? toOptions(item.children) : undefined,
  }))
}

export const Cascader = defineComponent({
  name: 'CfCascader',
  props: {
    modelValue: { type: Array as PropType<(string | number)[]>, /**
                                                                 * default：执行当前位置的功能逻辑。
                                                                 * 定位：`packages/ui-antd-vue/src/components/Cascader.ts:24`。
                                                                 * 功能：处理参数消化、状态变更与调用链行为同步。
                                                                 * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
                                                                 * @returns 返回当前分支执行后的处理结果。
                                                                 */
      /**
       * default：执行当前位置的功能逻辑。
       * 定位：`packages/ui-antd-vue/src/components/Cascader.ts:31`。
       * 功能：处理参数消化、状态变更与调用链行为同步。
       * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
       * @returns 返回当前分支执行后的处理结果。
       */
      default: () => [] },
    dataSource: { type: Array as PropType<DataSourceItem[]>, /**
                                                              * default：执行当前位置的功能逻辑。
                                                              * 定位：`packages/ui-antd-vue/src/components/Cascader.ts:25`。
                                                              * 功能：处理参数消化、状态变更与调用链行为同步。
                                                              * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
                                                              * @returns 返回当前分支执行后的处理结果。
                                                              */
      /**
       * default：执行当前位置的功能逻辑。
       * 定位：`packages/ui-antd-vue/src/components/Cascader.ts:39`。
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
   * 定位：`packages/ui-antd-vue/src/components/Cascader.ts:31`。
   * 功能：处理参数消化、状态变更与调用链行为同步。
   * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
   * @param props 参数 props 为当前功能所需的输入信息。
   * @returns 返回当前分支执行后的处理结果。
   */
  setup(props, { emit }) {
    const options = computed(() => toOptions(props.dataSource))
    return () => h(ACascader, {
      'value': props.modelValue as any,
      'options': options.value as any,
      'placeholder': props.placeholder,
      'disabled': props.disabled,
      /**
       * onUpdate:value：执行当前位置的功能逻辑。
       * 定位：`packages/ui-antd-vue/src/components/Cascader.ts:38`。
       * 功能：处理参数消化、状态变更与调用链行为同步。
       * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
       * @param v 参数 v 为当前功能所需的输入信息。
       * @returns 返回当前分支执行后的处理结果。
       */
      'onUpdate:value': (v: unknown) => emit('update:modelValue', (v ?? []) as (string | number)[]),
      /**
       * onFocus：执行当前位置的功能逻辑。
       * 定位：`packages/ui-antd-vue/src/components/Cascader.ts:39`。
       * 功能：处理参数消化、状态变更与调用链行为同步。
       * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
       * @returns 返回当前分支执行后的处理结果。
       */
      'onFocus': () => emit('focus'),
      /**
       * onBlur：执行当前位置的功能逻辑。
       * 定位：`packages/ui-antd-vue/src/components/Cascader.ts:40`。
       * 功能：处理参数消化、状态变更与调用链行为同步。
       * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
       * @returns 返回当前分支执行后的处理结果。
       */
      'onBlur': () => emit('blur'),
    })
  },
})
