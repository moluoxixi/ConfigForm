import type React from 'react'

interface CanvasMaskLayerProps {
  children: React.ReactNode
}

export function CanvasMaskLayer({ children }: CanvasMaskLayerProps): React.ReactElement {
  return (
    <div className="cf-lc-mask-layer cf-lc-mask-layer--canvas">
      <div className="cf-lc-mask-layer-content">{children}</div>
      <span className="cf-lc-mask-layer-overlay" aria-hidden="true" />
    </div>
  )
}
