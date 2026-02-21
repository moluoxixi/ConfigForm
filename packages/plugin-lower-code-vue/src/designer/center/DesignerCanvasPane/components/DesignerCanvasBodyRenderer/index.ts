import type { DesignerNode } from '@moluoxixi/plugin-lower-code-core'
import type { PropType } from 'vue'
import type { RenderDropList } from '../../types'
import { defineComponent, h } from 'vue'

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
  setup(props) {
    return () => h('div', {
      class: 'cf-lc-canvas-wrap',
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
