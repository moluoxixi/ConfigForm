import type { DesignerFieldNode } from '@moluoxixi/plugin-lower-code-core'
import { previewValueByNode } from '@moluoxixi/plugin-lower-code-core'
import React from 'react'
import { switchLabelStyle } from '../shared'

/**
 * Field Preview Control Props：类型接口定义。
 * 所属模块：`packages/plugin-lower-code-react/src/designer/materials/components/switch/index.tsx`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
interface FieldPreviewControlProps {
  node: DesignerFieldNode
}

/**
 * Switch Material Card Preview：当前功能模块的核心执行单元。
 * 所属模块：`packages/plugin-lower-code-react/src/designer/materials/components/switch/index.tsx`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
 */
export function SwitchMaterialCardPreview(): React.ReactElement {
  return (
    <div className="cf-lc-material-preview-switch-wrap">
      <span className="cf-lc-material-preview-switch" />
    </div>
  )
}

/**
 * Switch Field Preview Control：当前功能模块的核心执行单元。
 * 所属模块：`packages/plugin-lower-code-react/src/designer/materials/components/switch/index.tsx`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param param1 原始解构参数（{ node }）用于提供节点数据并定位或更新目标节点。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
 */
export function SwitchFieldPreviewControl({ node }: FieldPreviewControlProps): React.ReactElement {
  return (
    <label style={switchLabelStyle}>
      <input type="checkbox" disabled checked={Boolean(previewValueByNode(node))} readOnly />
      开关值
    </label>
  )
}
