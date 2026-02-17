import type { MaterialItem } from '@moluoxixi/plugin-lower-code-core'
import type React from 'react'
import type { LowCodeDesignerRenderContext } from '../types'
import { DesignerCardHeader } from '../shared/CardHeader'
import { MaterialPreview } from './MaterialPreview'

interface MaterialCardProps {
  item: MaterialItem
  renderMaterialPreview: (item: MaterialItem, context: LowCodeDesignerRenderContext) => React.ReactElement
}

export function MaterialCard({
  item,
  renderMaterialPreview,
}: MaterialCardProps): React.ReactElement {
  return (
    <div data-material-id={item.id} className="cf-lc-material-item">
      <DesignerCardHeader
        title={item.label}
        description={item.description}
        className="cf-lc-material-head"
        titleClassName="cf-lc-material-title"
        descriptionClassName="cf-lc-material-desc-inline"
      />
      <MaterialPreview
        item={item}
        phase="material"
        renderMaterialPreview={renderMaterialPreview}
      />
    </div>
  )
}
