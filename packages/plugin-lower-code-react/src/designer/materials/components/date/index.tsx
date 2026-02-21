import type { DesignerFieldNode } from '@moluoxixi/plugin-lower-code-core'
import { previewValueByNode } from '@moluoxixi/plugin-lower-code-core'
import React from 'react'
import { previewControlStyle } from '../shared'

interface FieldPreviewControlProps {
  node: DesignerFieldNode
}

/**
 * Date Material Card Preview：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 Date Material Card Preview 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
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

/**
 * Date Field Preview Control：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 Date Field Preview Control 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
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
