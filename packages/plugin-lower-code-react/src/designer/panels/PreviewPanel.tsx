import type { DesignerFieldNode } from '@moluoxixi/plugin-lower-code-core'
import type {
  LowCodeDesignerRenderContext,
} from '../types'
import React from 'react'
import { CanvasMaskLayer } from '../shared/CanvasMaskLayer'

interface PreviewPanelProps {
  fields: DesignerFieldNode[]
  renderFieldPreviewControl: (node: DesignerFieldNode, context: LowCodeDesignerRenderContext) => React.ReactElement
}

/**
 * Preview Panel：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 Preview Panel 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
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
                (
                {field.name}
                )
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
