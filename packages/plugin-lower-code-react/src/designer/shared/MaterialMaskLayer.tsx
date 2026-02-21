import type React from 'react'

interface MaterialMaskLayerProps {
  children: React.ReactNode
}

/**
 * Material Mask Layer：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 Material Mask Layer 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
export function MaterialMaskLayer({ children }: MaterialMaskLayerProps): React.ReactElement {
  return (
    <div className="cf-lc-mask-layer cf-lc-mask-layer--material cf-lc-mask-layer--locked">
      <div className="cf-lc-mask-layer-content">{children}</div>
      <span className="cf-lc-mask-layer-overlay" aria-hidden="true" />
    </div>
  )
}
