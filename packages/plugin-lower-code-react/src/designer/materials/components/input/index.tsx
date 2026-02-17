import type { DesignerFieldNode } from '@moluoxixi/plugin-lower-code-core'
import { previewValueByNode } from '@moluoxixi/plugin-lower-code-core'
import React from 'react'
import { previewControlStyle } from '../shared'

interface FieldPreviewControlProps {
  node: DesignerFieldNode
}

export function InputMaterialCardPreview(): React.ReactElement {
  return (
    <div className="cf-lc-material-preview-control">
      <span className="cf-lc-material-preview-placeholder">请输入</span>
    </div>
  )
}

export function InputFieldPreviewControl({ node }: FieldPreviewControlProps): React.ReactElement {
  return (
    <input
      type="text"
      disabled
      value={String(previewValueByNode(node))}
      readOnly
      placeholder={`请输入${node.title}`}
      style={previewControlStyle}
    />
  )
}
