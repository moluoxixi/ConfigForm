import type React from 'react'
import type { DesignerMaterialListRendererProps } from '../../types'
import { MaterialCard } from '../../../../materials/MaterialCard'

/**
 * Designer Material List Renderer：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 Designer Material List Renderer 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
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
