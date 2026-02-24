import { ElButton } from 'element-plus'
import { defineComponent, h } from 'vue'

const ButtonComponent = ElButton as any

/** Steps 导航按钮 */
export const LayoutStepActions = defineComponent({
  name: 'CfLayoutStepActions',
  props: {
    current: { type: Number, default: 0 },
    total: { type: Number, default: 1 },
    loading: Boolean,
  },
  emits: ['prev', 'next'],
  /**
   * setup：执行当前位置的功能逻辑。
   * 定位：`packages/ui-element-plus/src/components/LayoutStepActions.ts:15`。
   * 功能：处理参数消化、状态变更与调用链行为同步。
   * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
   * @param props 参数 props 为当前功能所需的输入信息。
   * @returns 返回当前分支执行后的处理结果。
   */
  setup(props, { emit }) {
    return () => h('div', { style: 'display: flex; justify-content: space-between; margin-top: 16px' }, [
      h('div', {}, props.current > 0
        ? h(ButtonComponent, { /**
                                * onClick：执行当前位置的功能逻辑。
                                * 定位：`packages/ui-element-plus/src/components/LayoutStepActions.ts:18`。
                                * 功能：处理参数消化、状态变更与调用链行为同步。
                                * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
                                * @returns 返回当前分支执行后的处理结果。
                                */
            /**
             * onClick：执行当前位置的功能逻辑。
             * 定位：`packages/ui-element-plus/src/components/LayoutStepActions.ts:33`。
             * 功能：处理参数消化、状态变更与调用链行为同步。
             * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
             * @returns 返回当前分支执行后的处理结果。
             */
            onClick: () => emit('prev'),
          }, () => '上一步')
        : undefined),
      props.current < props.total - 1
        ? h(ButtonComponent, { type: 'primary', loading: props.loading, /**
                                                                         * onClick：执行当前位置的功能逻辑。
                                                                         * 定位：`packages/ui-element-plus/src/components/LayoutStepActions.ts:21`。
                                                                         * 功能：处理参数消化、状态变更与调用链行为同步。
                                                                         * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
                                                                         * @returns 返回当前分支执行后的处理结果。
                                                                         */
            /**
             * onClick：执行当前位置的功能逻辑。
             * 定位：`packages/ui-element-plus/src/components/LayoutStepActions.ts:43`。
             * 功能：处理参数消化、状态变更与调用链行为同步。
             * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
             * @returns 返回当前分支执行后的处理结果。
             */
            onClick: () => emit('next') }, () => '下一步')
        : null,
    ])
  },
})
