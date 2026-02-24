import type { ISchema } from '@moluoxixi/core'
import type {
  DesignerFieldNode,
  LowCodeDesignerComponentDefinitions,
  LowCodeDesignerRenderContext,
  MaterialItem,
} from '@moluoxixi/plugin-lower-code-core'
import type { ReactNode } from 'react'

export type {
  LowCodeDesignerComponentDefinition,
  LowCodeDesignerComponentDefinitions,
  LowCodeDesignerEditableProp,
  LowCodeDesignerEditablePropEditor,
  LowCodeDesignerEditablePropOption,
  LowCodeDesignerRenderContext,
} from '@moluoxixi/plugin-lower-code-core'

/**
 * Low Code Preview Render Mode：描述该模块使用的类型别名语义。
 * 所属模块：`packages/plugin-lower-code-react/src/designer/types.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export type LowCodePreviewRenderMode = 'auto' | 'mock' | 'registry'

/**
 * Low Code Designer Renderers：描述该模块对外暴露的数据结构。
 * 所属模块：`packages/plugin-lower-code-react/src/designer/types.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export interface LowCodeDesignerRenderers {
  renderMaterialPreview?: (item: MaterialItem, context: LowCodeDesignerRenderContext) => ReactNode | undefined
  renderFieldPreviewControl?: (node: DesignerFieldNode, context: LowCodeDesignerRenderContext) => ReactNode | undefined
}

/**
 * Low Code Designer Props：描述该模块对外暴露的数据结构。
 * 所属模块：`packages/plugin-lower-code-react/src/designer/types.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export interface LowCodeDesignerProps {
  value?: unknown
  onChange?: (value: ISchema) => void
  minCanvasHeight?: number
  previewRenderMode?: LowCodePreviewRenderMode
  renderers?: LowCodeDesignerRenderers
  componentDefinitions?: LowCodeDesignerComponentDefinitions
}
