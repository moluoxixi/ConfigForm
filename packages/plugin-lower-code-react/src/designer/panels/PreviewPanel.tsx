import type { DesignerFieldNode } from '@moluoxixi/plugin-lower-code-core'
import React from 'react'
import type {
  LowCodeDesignerRenderContext,
} from '../types'
import { CanvasMaskLayer } from '../shared/CanvasMaskLayer'

interface PreviewPanelProps {
  fields: DesignerFieldNode[]
  renderFieldPreviewControl: (node: DesignerFieldNode, context: LowCodeDesignerRenderContext) => React.ReactElement
}

export function PreviewPanel({
  fields,
  renderFieldPreviewControl,
}: PreviewPanelProps): React.ReactElement {
  return (
    <section className="cf-lc-panel">
      <h4 className="cf-lc-panel-title">实时预览</h4>
      <div className="cf-lc-preview-list">
        {fields.map(field => (
          <div key={field.id} className="cf-lc-preview-item">
            <div className="cf-lc-preview-title">
              {field.required ? '* ' : ''}
              {field.title}
              <span style={{ color: '#94a3b8', fontWeight: 500 }}>
                {' '}
                ({field.name})
              </span>
            </div>
            <CanvasMaskLayer>
              {renderFieldPreviewControl(field, { phase: 'preview', readonly: false })}
            </CanvasMaskLayer>
          </div>
        ))}
        {fields.length === 0 && (
          <div className="cf-lc-empty">
            暂无字段，请从左侧物料区拖拽组件到画布。
          </div>
        )}
      </div>
    </section>
  )
}
