import type { DesignerNode } from '@moluoxixi/plugin-lower-code-core'
import type { PropType } from 'vue'
import type { RenderDropList } from '../../types'
import { defineComponent, h } from 'vue'

/**
 * Designer Canvas Body Renderer：。
 * 所属模块：`packages/plugin-lower-code-vue/src/designer/center/DesignerCanvasPane/components/DesignerCanvasBodyRenderer/index.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export const DesignerCanvasBodyRenderer = defineComponent({
  name: 'DesignerCanvasBodyRenderer',
  props: {
    nodes: { type: Array as PropType<DesignerNode[]>, required: true },
    minCanvasHeight: { type: Number, default: 420 },
    rootTargetKey: { type: String, required: true },
    setCanvasHost: {
      type: Function as PropType<(element: HTMLElement | null) => void>,
      required: true,
    },
    renderDropList: {
      type: Function as PropType<RenderDropList>,
      required: true,
    },
  },
  /**
   * setup：。
   * 所属模块：`packages/plugin-lower-code-vue/src/designer/center/DesignerCanvasPane/components/DesignerCanvasBodyRenderer/index.ts`。
   * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
   * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
   * @param props 参数 `props`用于提供当前函数执行所需的输入信息。
   * @returns 返回处理结果。
   */
  setup(props) {
    return () => h('div', {
      class: 'cf-lc-canvas-wrap',
      /**
       * ref：执行当前功能逻辑。
       *
       * @param element 参数 element 的输入说明。
       */

      ref: (element: unknown) => {
        props.setCanvasHost(element as HTMLElement | null)
      },
    }, [
      props.renderDropList(
        props.nodes,
        props.rootTargetKey,
        0,
        '从左侧拖拽一个字段或容器到这里开始设计。',
      ),
    ])
  },
})
