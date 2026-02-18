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

export type LowCodePreviewRenderMode = 'auto' | 'mock' | 'registry'

export interface LowCodeDesignerRenderers {
  renderMaterialPreview?: (item: MaterialItem, context: LowCodeDesignerRenderContext) => ReactNode | undefined
  renderFieldPreviewControl?: (node: DesignerFieldNode, context: LowCodeDesignerRenderContext) => ReactNode | undefined
}

export interface LowCodeDesignerProps {
  value?: unknown
  onChange?: (value: ISchema) => void
  minCanvasHeight?: number
  previewRenderMode?: LowCodePreviewRenderMode
  renderers?: LowCodeDesignerRenderers
  componentDefinitions?: LowCodeDesignerComponentDefinitions
}
