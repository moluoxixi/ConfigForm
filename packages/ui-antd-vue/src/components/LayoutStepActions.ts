import { Button as AButton } from 'ant-design-vue'
import { defineComponent, h } from 'vue'

/**
 * Button Component：变量或常量声明。
 * 所属模块：`packages/ui-antd-vue/src/components/LayoutStepActions.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
const ButtonComponent = AButton as any

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
   * setup：当前功能模块的核心执行单元。
   * 所属模块：`packages/ui-antd-vue/src/components/LayoutStepActions.ts`。
   * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
   * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
   * @param props 参数 `props`用于提供当前函数执行所需的输入信息。
   * @param context 组件上下文对象。
   * @param context.emit 组件事件派发函数。
   * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
   */
  setup(props, context) {
    const { emit } = context
    return () =>
      h('div', { style: 'display: flex; justify-content: space-between; margin-top: 16px' }, [
        h(
          'div',
          {},
          props.current > 0
            ? h(
                ButtonComponent,
                {
                  /**
                   * onClick：执行当前功能逻辑。
                   *
                   * @returns 返回当前功能的处理结果。
                   */
                  onClick: () => emit('prev'),
                },
                () => '上一步',
              )
            : undefined,
        ),
        props.current < props.total - 1
          ? h(
              ButtonComponent,
              {
                type: 'primary',
                loading: props.loading,
                /**
                 * onClick：执行当前功能逻辑。
                 *
                 * @returns 返回当前功能的处理结果。
                 */
                onClick: () => emit('next'),
              },
              () => '下一步',
            )
          : null,
      ])
  },
})
