import type { DesignerFieldNode } from '@moluoxixi/plugin-lower-code-core'
import React from 'react'
import { previewControlStyle } from '../shared'

/**
 * Field Preview Control Props：类型接口定义。
 * 所属模块：`packages/plugin-lower-code-react/src/designer/materials/components/select/index.tsx`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
interface FieldPreviewControlProps {
  node: DesignerFieldNode
}

/**
 * Select Material Card Preview：当前功能模块的核心执行单元。
 * 所属模块：`packages/plugin-lower-code-react/src/designer/materials/components/select/index.tsx`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
 */
export function SelectMaterialCardPreview(): React.ReactElement {
  return (
    <div className="cf-lc-material-preview-control cf-lc-material-preview-control--select">
      <span className="cf-lc-material-preview-placeholder">请选择</span>
      <span className="cf-lc-material-preview-arrow">▾</span>
    </div>
  )
}

/**
 * Select Field Preview Control：当前功能模块的核心执行单元。
 * 所属模块：`packages/plugin-lower-code-react/src/designer/materials/components/select/index.tsx`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param param1 组件入参对象。
 * @param param1.node 当前字段节点，用于读取可选项配置与标题信息。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
 */
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
