import type { DesignerNode } from '@moluoxixi/plugin-lower-code-core'
import type { PropType, VNodeChild } from 'vue'
import { defineComponent } from 'vue'

/**
 * Designer Field Preview Node：。
 * 所属模块：`packages/plugin-lower-code-vue/src/designer/center/renderers/DesignerCanvasPreviewRenderer.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
type DesignerFieldPreviewNode = Extract<DesignerNode, { kind: 'field' }>

/**
 * Designer Canvas Preview Renderer：。
 * 所属模块：`packages/plugin-lower-code-vue/src/designer/center/renderers/DesignerCanvasPreviewRenderer.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export const DesignerCanvasPreviewRenderer = defineComponent({
  name: 'DesignerCanvasPreviewRenderer',
  props: {
    node: { type: Object as PropType<DesignerFieldPreviewNode>, required: true },
    render: { type: Function as PropType<(node: DesignerFieldPreviewNode) => VNodeChild>, required: true },
  },
  /**
   * setup：。
   * 所属模块：`packages/plugin-lower-code-vue/src/designer/center/renderers/DesignerCanvasPreviewRenderer.ts`。
   * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
   * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
   * @param props 参数 `props`用于提供当前函数执行所需的输入信息。
   * @returns 返回处理结果。
   */
  setup(props) {
    return () => props.render(props.node)
  },
})
