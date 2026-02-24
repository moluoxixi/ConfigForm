import type { DesignerFieldNode } from '@moluoxixi/plugin-lower-code-core'
import React from 'react'
import { previewControlStyle } from '../shared'

/**
 * Field Preview Control Props：描述该模块对外暴露的数据结构。
 * 所属模块：`packages/plugin-lower-code-react/src/designer/materials/components/textarea/index.tsx`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
interface FieldPreviewControlProps {
  node: DesignerFieldNode
}

/**
 * Textarea Material Card Preview：封装该模块的核心渲染与交互逻辑。
 * 所属模块：`packages/plugin-lower-code-react/src/designer/materials/components/textarea/index.tsx`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
 */
export function TextareaMaterialCardPreview(): React.ReactElement {
  return (
    <div className="cf-lc-material-preview-textarea">
      <span />
      <span />
      <span />
    </div>
  )
}

/**
 * Textarea Field Preview Control：封装该模块的核心渲染与交互逻辑。
 * 所属模块：`packages/plugin-lower-code-react/src/designer/materials/components/textarea/index.tsx`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param param1 组件入参对象。
 * @param param1.node 当前字段节点，用于读取标题和占位提示信息。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
 */
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
