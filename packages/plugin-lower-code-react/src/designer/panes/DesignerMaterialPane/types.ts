import type {
  MaterialContainerItem,
  MaterialFieldItem,
  MaterialItem,
} from '@moluoxixi/plugin-lower-code-core'
import type React from 'react'
import type { LowCodeDesignerRenderContext } from '../../types'

/**
 * Designer Material Pane Props：类型接口定义。
 * 所属模块：`packages/plugin-lower-code-react/src/designer/panes/DesignerMaterialPane/types.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export interface DesignerMaterialPaneProps {
  componentMaterials: MaterialFieldItem[]
  layoutMaterials: MaterialContainerItem[]
  materialHostRef: React.RefObject<HTMLDivElement>
  renderMaterialPreview: (item: MaterialItem, context: LowCodeDesignerRenderContext) => React.ReactElement
}

/**
 * Designer Material Toolbar Renderer Props：类型接口定义。
 * 所属模块：`packages/plugin-lower-code-react/src/designer/panes/DesignerMaterialPane/types.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export interface DesignerMaterialToolbarRendererProps {
  keyword: string
  onKeywordChange: (nextKeyword: string) => void
  totalCount: number
  filteredCount: number
}

/**
 * Designer Material List Renderer Props：类型接口定义。
 * 所属模块：`packages/plugin-lower-code-react/src/designer/panes/DesignerMaterialPane/types.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export interface DesignerMaterialListRendererProps {
  items: MaterialItem[]
  renderMaterialPreview: (item: MaterialItem, context: LowCodeDesignerRenderContext) => React.ReactElement
}
