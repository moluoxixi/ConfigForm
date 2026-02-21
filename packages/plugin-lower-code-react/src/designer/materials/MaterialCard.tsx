import type { MaterialItem } from '@moluoxixi/plugin-lower-code-core'
import type React from 'react'
import type { LowCodeDesignerRenderContext } from '../types'
import { DesignerCardHeader } from '../shared/CardHeader'
import { MaterialPreview } from './MaterialPreview'

interface MaterialCardProps {
  item: MaterialItem
  renderMaterialPreview: (item: MaterialItem, context: LowCodeDesignerRenderContext) => React.ReactElement
}

/**
 * Material Card：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 Material Card 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
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
