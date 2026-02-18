import type {
  MaterialContainerItem,
  MaterialFieldItem,
  MaterialItem,
} from '@moluoxixi/plugin-lower-code-core'
import type React from 'react'
import type { LowCodeDesignerRenderContext } from '../../types'

export interface DesignerMaterialPaneProps {
  componentMaterials: MaterialFieldItem[]
  layoutMaterials: MaterialContainerItem[]
  materialHostRef: React.RefObject<HTMLDivElement>
  renderMaterialPreview: (item: MaterialItem, context: LowCodeDesignerRenderContext) => React.ReactElement
}

export interface DesignerMaterialToolbarRendererProps {
  keyword: string
  onKeywordChange: (nextKeyword: string) => void
  totalCount: number
  filteredCount: number
}

export interface DesignerMaterialListRendererProps {
  items: MaterialItem[]
  renderMaterialPreview: (item: MaterialItem, context: LowCodeDesignerRenderContext) => React.ReactElement
}
