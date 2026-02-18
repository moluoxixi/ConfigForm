import type { DesignerNode } from '@moluoxixi/plugin-lower-code-core'
import type { PropType, VNodeChild } from 'vue'
import { defineComponent } from 'vue'

type DesignerFieldPreviewNode = Extract<DesignerNode, { kind: 'field' }>

export const DesignerCanvasPreviewRenderer = defineComponent({
  name: 'DesignerCanvasPreviewRenderer',
  props: {
    node: { type: Object as PropType<DesignerFieldPreviewNode>, required: true },
    render: { type: Function as PropType<(node: DesignerFieldPreviewNode) => VNodeChild>, required: true },
  },
  setup(props) {
    return () => props.render(props.node)
  },
})
