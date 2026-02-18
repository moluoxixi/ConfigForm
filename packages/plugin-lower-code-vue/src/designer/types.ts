import type {
  DesignerFieldNode,
  LowCodeDesignerRenderContext,
  MaterialItem,
} from '@moluoxixi/plugin-lower-code-core'
import type { VNodeChild } from 'vue'

export type {
  LowCodeDesignerComponentDefinition,
  LowCodeDesignerComponentDefinitions,
  LowCodeDesignerEditableProp,
  LowCodeDesignerEditablePropEditor,
  LowCodeDesignerEditablePropOption,
  LowCodeDesignerRenderContext,
} from '@moluoxixi/plugin-lower-code-core'

export interface LowCodeDesignerRenderers {
  renderMaterialPreview?: (item: MaterialItem, context: LowCodeDesignerRenderContext) => VNodeChild | undefined
  renderFieldPreviewControl?: (node: DesignerFieldNode, context: LowCodeDesignerRenderContext) => VNodeChild | undefined
}
