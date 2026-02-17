import type { DesignerFieldNode } from '@moluoxixi/plugin-lower-code-core'
import React from 'react'
import { previewControlStyle } from '../shared'

interface FieldPreviewControlProps {
  node: DesignerFieldNode
}

export function TextareaMaterialCardPreview(): React.ReactElement {
  return (
    <div className="cf-lc-material-preview-textarea">
      <span />
      <span />
      <span />
    </div>
  )
}

export function TextareaFieldPreviewControl({ node }: FieldPreviewControlProps): React.ReactElement {
  return (
    <textarea
      rows={3}
      disabled
      placeholder={`请输入${node.title}`}
      style={{ ...previewControlStyle, resize: 'vertical', minHeight: 78 }}
    />
  )
}
