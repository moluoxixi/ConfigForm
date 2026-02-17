import type {
  DesignerFieldNode,
  MaterialItem,
} from '@moluoxixi/plugin-lower-code-core'
import type React from 'react'
import type {
  LowCodeDesignerRenderContext,
  LowCodeDesignerRenderers,
} from '../types'

export interface ResolvedLowCodeDesignerRenderers {
  renderMaterialPreview: (item: MaterialItem, context: LowCodeDesignerRenderContext) => React.ReactElement
  renderFieldPreviewControl: (node: DesignerFieldNode, context: LowCodeDesignerRenderContext) => React.ReactElement
}

export interface ResolveLowCodeDesignerRenderersOptions {
  mode: 'mock' | 'registry'
  custom?: LowCodeDesignerRenderers
  fallback: ResolvedLowCodeDesignerRenderers
  builtin: ResolvedLowCodeDesignerRenderers
}
