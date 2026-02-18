import type React from 'react'

interface CanvasMaskLayerProps {
  children: React.ReactNode
  actions?: React.ReactNode
  disablePointerEvents?: boolean
}

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
