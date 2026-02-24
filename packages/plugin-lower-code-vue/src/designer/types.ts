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

/**
 * Low Code Designer Renderers：类型接口定义。
 * 所属模块：`packages/plugin-lower-code-vue/src/designer/types.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export interface LowCodeDesignerRenderers {
  renderMaterialPreview?: (item: MaterialItem, context: LowCodeDesignerRenderContext) => VNodeChild | undefined
  renderFieldPreviewControl?: (node: DesignerFieldNode, context: LowCodeDesignerRenderContext) => VNodeChild | undefined
}
