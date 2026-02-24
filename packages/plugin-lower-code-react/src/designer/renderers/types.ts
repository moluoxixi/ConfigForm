import type {
  DesignerFieldNode,
  MaterialItem,
} from '@moluoxixi/plugin-lower-code-core'
import type React from 'react'
import type {
  LowCodeDesignerRenderContext,
  LowCodeDesignerRenderers,
} from '../types'

/**
 * Resolved Low Code Designer Renderers：类型接口定义。
 * 所属模块：`packages/plugin-lower-code-react/src/designer/renderers/types.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export interface ResolvedLowCodeDesignerRenderers {
  renderMaterialPreview: (item: MaterialItem, context: LowCodeDesignerRenderContext) => React.ReactElement
  renderFieldPreviewControl: (node: DesignerFieldNode, context: LowCodeDesignerRenderContext) => React.ReactElement
}

/**
 * Resolve Low Code Designer Renderers Options：类型接口定义。
 * 所属模块：`packages/plugin-lower-code-react/src/designer/renderers/types.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export interface ResolveLowCodeDesignerRenderersOptions {
  mode: 'mock' | 'registry'
  custom?: LowCodeDesignerRenderers
  fallback: ResolvedLowCodeDesignerRenderers
  builtin: ResolvedLowCodeDesignerRenderers
}
