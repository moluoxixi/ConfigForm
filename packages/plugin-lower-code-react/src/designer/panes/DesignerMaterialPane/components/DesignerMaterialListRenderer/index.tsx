import type React from 'react'
import { MaterialCard } from '../../../../materials/MaterialCard'
import type { DesignerMaterialListRendererProps } from '../../types'

export function DesignerMaterialListRenderer({
  items,
  renderMaterialPreview,
}: DesignerMaterialListRendererProps): React.ReactElement {
  return (
    <div className="cf-lc-side-scroll">
      <div className="cf-lc-material-list cf-lc-material-list--tab" data-cf-material-list="true">
        {items.map(item => (
          <MaterialCard
            key={item.id}
            item={item}
            renderMaterialPreview={renderMaterialPreview}
          />
        ))}
      </div>
      {items.length === 0
        ? (
            <div className="cf-lc-empty cf-lc-empty--compact">
              未找到匹配物料，请调整搜索关键词。
            </div>
          )
        : null}
    </div>
  )
}
