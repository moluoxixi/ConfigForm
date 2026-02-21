import type React from 'react'

interface CanvasMaskLayerProps {
  children: React.ReactNode
  actions?: React.ReactNode
  disablePointerEvents?: boolean
}

/**
 * Canvas Mask Layer：负责“判断Canvas Mask Layer”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 Canvas Mask Layer 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
export function CanvasMaskLayer({
  children,
  actions,
  disablePointerEvents = true,
}: CanvasMaskLayerProps): React.ReactElement {
  return (
    <div
      className={[
        'cf-lc-mask-layer',
        'cf-lc-mask-layer--canvas',
        disablePointerEvents ? 'cf-lc-mask-layer--locked' : '',
      ].filter(Boolean).join(' ')}
    >
      <div className="cf-lc-mask-layer-content">{children}</div>
      {actions
        ? (
            <div className="cf-lc-mask-layer-actions">
              {actions}
            </div>
          )
        : null}
      <span className="cf-lc-mask-layer-overlay" aria-hidden="true" />
    </div>
  )
}
