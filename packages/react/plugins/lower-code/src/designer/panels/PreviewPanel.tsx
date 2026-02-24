import type { DesignerFieldNode } from '@moluoxixi/plugin-lower-code-core'
import type {
  LowCodeDesignerRenderContext,
} from '../types'
import React from 'react'
import { CanvasMaskLayer } from '../shared/CanvasMaskLayer'

/**
 * Preview Panel Props：描述该模块对外暴露的数据结构。
 * 所属模块：`packages/plugin-lower-code-react/src/designer/panels/PreviewPanel.tsx`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
interface PreviewPanelProps {
  fields: DesignerFieldNode[]
  renderFieldPreviewControl: (node: DesignerFieldNode, context: LowCodeDesignerRenderContext) => React.ReactElement
}

/**
 * Preview Panel：封装该模块的核心渲染与交互逻辑。
 * 所属模块：`packages/plugin-lower-code-react/src/designer/panels/PreviewPanel.tsx`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param param1 组件入参对象。
 * @param param1.fields 画布中已存在的字段节点列表。
 * @param param1.renderFieldPreviewControl 字段预览控件渲染函数。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
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
