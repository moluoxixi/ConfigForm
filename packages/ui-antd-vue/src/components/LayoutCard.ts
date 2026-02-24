import type { PropType } from 'vue'
import { Card as ACard } from 'ant-design-vue'
import { defineComponent, h } from 'vue'

/** Card 布局容器适配 */
export const LayoutCard = defineComponent({
  name: 'CfLayoutCard',
  props: {
    title: String,
    size: { type: String as PropType<'default' | 'small'>, default: 'small' },
  },
  /**
   * setup：当前功能模块的核心执行单元。
   * 所属模块：`packages/ui-antd-vue/src/components/LayoutCard.ts`。
   * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
   * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
   * @param props 参数 `props`用于提供当前函数执行所需的输入信息。
   * @param param2 原始解构参数（{ slots }）用于提供当前函数执行所需的输入信息。
   * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
   */
  setup(props, { slots }) {
    return () => h(ACard, { title: props.title, size: props.size, style: 'margin-bottom: 16px' }, () => slots.default?.())
  },
})
