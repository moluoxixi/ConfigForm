import type { DesignerFieldNode } from '@moluoxixi/plugin-lower-code-core'
import { previewValueByNode } from '@moluoxixi/plugin-lower-code-core'
import React from 'react'
import { previewControlStyle } from '../shared'

/**
 * Field Preview Control Props：类型接口定义。
 * 所属模块：`packages/plugin-lower-code-react/src/designer/materials/components/date/index.tsx`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
interface FieldPreviewControlProps {
  node: DesignerFieldNode
}

/**
 * Date Material Card Preview：当前功能模块的核心执行单元。
 * 所属模块：`packages/plugin-lower-code-react/src/designer/materials/components/date/index.tsx`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
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
 * Date Field Preview Control：当前功能模块的核心执行单元。
 * 所属模块：`packages/plugin-lower-code-react/src/designer/materials/components/date/index.tsx`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param param1 原始解构参数（{ node }）用于提供节点数据并定位或更新目标节点。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
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
