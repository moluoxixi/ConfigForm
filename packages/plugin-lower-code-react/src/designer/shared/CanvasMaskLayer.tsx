import type React from 'react'

/**
 * Canvas Mask Layer Props：类型接口定义。
 * 所属模块：`packages/plugin-lower-code-react/src/designer/shared/CanvasMaskLayer.tsx`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
interface CanvasMaskLayerProps {
  children: React.ReactNode
  actions?: React.ReactNode
  disablePointerEvents?: boolean
}

/**
 * Canvas Mask Layer：当前功能模块的核心执行单元。
 * 所属模块：`packages/plugin-lower-code-react/src/designer/shared/CanvasMaskLayer.tsx`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param param1 原始解构参数（{
  children,
  actions,
  disablePointerEvents = true,
}）用于传递事件上下文，使逻辑能基于交互状态进行处理。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
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
