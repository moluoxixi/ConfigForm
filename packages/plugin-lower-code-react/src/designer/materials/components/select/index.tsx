import type { DesignerFieldNode } from '@moluoxixi/plugin-lower-code-core'
import React from 'react'
import { previewControlStyle } from '../shared'

interface FieldPreviewControlProps {
  node: DesignerFieldNode
}

export function SelectMaterialCardPreview(): React.ReactElement {
  return (
    <div className="cf-lc-material-preview-control cf-lc-material-preview-control--select">
      <span className="cf-lc-material-preview-placeholder">请选择</span>
      <span className="cf-lc-material-preview-arrow">▾</span>
    </div>
  )
}

export function SelectFieldPreviewControl({ node }: FieldPreviewControlProps): React.ReactElement {
  return (
    <select disabled style={previewControlStyle}>
      {node.enumOptions.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}
