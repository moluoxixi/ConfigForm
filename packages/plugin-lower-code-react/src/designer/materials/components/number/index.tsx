import type { DesignerFieldNode } from '@moluoxixi/plugin-lower-code-core'
import { previewValueByNode } from '@moluoxixi/plugin-lower-code-core'
import React from 'react'
import { previewControlStyle } from '../shared'

interface FieldPreviewControlProps {
  node: DesignerFieldNode
}

export function NumberMaterialCardPreview(): React.ReactElement {
  return (
    <div className="cf-lc-material-preview-control cf-lc-material-preview-control--number">
      <span className="cf-lc-material-preview-placeholder">0</span>
      <span className="cf-lc-material-preview-stepper">
        <i>+</i>
        <i>-</i>
      </span>
    </div>
  )
}

export function NumberFieldPreviewControl({ node }: FieldPreviewControlProps): React.ReactElement {
  return (
    <input
      type="number"
      disabled
      value={String(previewValueByNode(node))}
      readOnly
      style={previewControlStyle}
    />
  )
}
