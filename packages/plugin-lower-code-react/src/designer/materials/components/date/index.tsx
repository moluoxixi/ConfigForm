import type { DesignerFieldNode } from '@moluoxixi/plugin-lower-code-core'
import { previewValueByNode } from '@moluoxixi/plugin-lower-code-core'
import React from 'react'
import { previewControlStyle } from '../shared'

interface FieldPreviewControlProps {
  node: DesignerFieldNode
}

export function DateMaterialCardPreview(): React.ReactElement {
  return (
    <div className="cf-lc-material-preview-control cf-lc-material-preview-control--date">
      <span className="cf-lc-material-preview-placeholder">YYYY-MM-DD</span>
      <span className="cf-lc-material-preview-calendar">
        <i />
        <i />
      </span>
    </div>
  )
}

export function DateFieldPreviewControl({ node }: FieldPreviewControlProps): React.ReactElement {
  return (
    <input
      type="date"
      disabled
      value={String(previewValueByNode(node))}
      readOnly
      style={previewControlStyle}
    />
  )
}
