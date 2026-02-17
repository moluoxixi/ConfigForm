import type { DesignerFieldNode } from '@moluoxixi/plugin-lower-code-core'
import { previewValueByNode } from '@moluoxixi/plugin-lower-code-core'
import React from 'react'
import { switchLabelStyle } from '../shared'

interface FieldPreviewControlProps {
  node: DesignerFieldNode
}

export function SwitchMaterialCardPreview(): React.ReactElement {
  return (
    <div className="cf-lc-material-preview-switch-wrap">
      <span className="cf-lc-material-preview-switch" />
    </div>
  )
}

export function SwitchFieldPreviewControl({ node }: FieldPreviewControlProps): React.ReactElement {
  return (
    <label style={switchLabelStyle}>
      <input type="checkbox" disabled checked={Boolean(previewValueByNode(node))} readOnly />
      开关值
    </label>
  )
}
