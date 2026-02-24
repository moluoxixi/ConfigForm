import type {
  DesignerFieldComponent,
  DesignerFieldNode,
} from '@moluoxixi/plugin-lower-code-core'
import type React from 'react'
import { DateFieldPreviewControl } from '../components/date'
import { InputFieldPreviewControl } from '../components/input'
import { NumberFieldPreviewControl } from '../components/number'
import { SelectFieldPreviewControl } from '../components/select'
import { SwitchFieldPreviewControl } from '../components/switch'
import { TextareaFieldPreviewControl } from '../components/textarea'

/**
 * Field Preview Control Props：描述该模块对外暴露的数据结构。
 * 所属模块：`packages/plugin-lower-code-react/src/designer/materials/registry/field-preview-control.tsx`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
interface FieldPreviewControlProps {
  node: DesignerFieldNode
}

/**
 * FIELD PREVIEW CONTROL RENDERERS：定义该模块复用的常量配置。
 * 所属模块：`packages/plugin-lower-code-react/src/designer/materials/registry/field-preview-control.tsx`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
const FIELD_PREVIEW_CONTROL_RENDERERS: Record<DesignerFieldComponent, (props: FieldPreviewControlProps) => React.ReactElement> = {
  Input: InputFieldPreviewControl,
  Textarea: TextareaFieldPreviewControl,
  Select: SelectFieldPreviewControl,
  InputNumber: NumberFieldPreviewControl,
  Switch: SwitchFieldPreviewControl,
  DatePicker: DateFieldPreviewControl,
}

/**
 * render Field Preview Control：封装该模块的核心渲染与交互逻辑。
 * 所属模块：`packages/plugin-lower-code-react/src/designer/materials/registry/field-preview-control.tsx`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param node 参数 `node`用于提供节点数据并定位或更新目标节点。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
 */
export function renderFieldPreviewControl(node: DesignerFieldNode): React.ReactElement {
  const renderer = FIELD_PREVIEW_CONTROL_RENDERERS[node.component] ?? InputFieldPreviewControl
  return renderer({ node })
}
