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
   * setup：处理当前分支的交互与状态同步。
   * 功能：处理参数消化、状态变更与调用链行为同步。
   * @param props 参数 props 为当前功能所需的输入信息。
   * @returns 返回当前分支执行后的处理结果。
   */
  setup(props, { emit }) {
    return () => h('div', { style: 'display: flex; justify-content: space-between; margin-top: 16px' }, [
      h('div', {}, props.current > 0
        ? h(ButtonComponent, { /**
                                * onClick：处理当前分支的交互与状态同步。
                                * 功能：处理参数消化、状态变更与调用链行为同步。
                                * @returns 返回当前分支执行后的处理结果。
                                */
            /**
             * onClick：处理当前分支的交互与状态同步。
             * 功能：处理参数消化、状态变更与调用链行为同步。
             * @returns 返回当前分支执行后的处理结果。
             */
            onClick: () => emit('prev'),
          }, () => '上一步')
        : undefined),
      props.current < props.total - 1
        ? h(ButtonComponent, { type: 'primary', loading: props.loading, /**
                                                                         * onClick：处理当前分支的交互与状态同步。
                                                                         * 功能：处理参数消化、状态变更与调用链行为同步。
                                                                         * @returns 返回当前分支执行后的处理结果。
                                                                         */
            /**
             * onClick：处理当前分支的交互与状态同步。
             * 功能：处理参数消化、状态变更与调用链行为同步。
             * @returns 返回当前分支执行后的处理结果。
             */
            onClick: () => emit('next') }, () => '下一步')
        : null,
    ])
  },
})
