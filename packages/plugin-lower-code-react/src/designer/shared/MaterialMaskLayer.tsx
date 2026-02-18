import type React from 'react'

interface MaterialMaskLayerProps {
  children: React.ReactNode
}

export function MaterialMaskLayer({ children }: MaterialMaskLayerProps): React.ReactElement {
  return (
    <div className="cf-lc-mask-layer cf-lc-mask-layer--material cf-lc-mask-layer--locked">
      <div className="cf-lc-mask-layer-content">{children}</div>
      <span className="cf-lc-mask-layer-overlay" aria-hidden="true" />
    </div>
  )
}
