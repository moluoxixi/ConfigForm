import type { MaterialItem } from '@moluoxixi/plugin-lower-code-core'
import type React from 'react'
import type {
  LowCodeDesignerRenderContext,
} from '../types'
import { MaterialMaskLayer } from '../shared/MaterialMaskLayer'

interface MaterialPreviewProps {
  item: MaterialItem
  phase: LowCodeDesignerRenderContext['phase']
  renderMaterialPreview: (item: MaterialItem, context: LowCodeDesignerRenderContext) => React.ReactElement
}

export function MaterialPreview({
  item,
  phase,
  renderMaterialPreview,
}: MaterialPreviewProps): React.ReactElement {
  return (
    <div className={`cf-lc-material-preview cf-lc-material-preview--material cf-lc-material-preview--${item.id}`}>
      <MaterialMaskLayer>
        {renderMaterialPreview(item, { phase, readonly: false })}
      </MaterialMaskLayer>
    </div>
  )
}
