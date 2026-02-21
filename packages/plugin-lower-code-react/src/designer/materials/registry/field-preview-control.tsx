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

interface FieldPreviewControlProps {
  node: DesignerFieldNode
}

const FIELD_PREVIEW_CONTROL_RENDERERS: Record<DesignerFieldComponent, (props: FieldPreviewControlProps) => React.ReactElement> = {
  Input: InputFieldPreviewControl,
  Textarea: TextareaFieldPreviewControl,
  Select: SelectFieldPreviewControl,
  InputNumber: NumberFieldPreviewControl,
  Switch: SwitchFieldPreviewControl,
  DatePicker: DateFieldPreviewControl,
}

/**
 * render Field Preview Control：负责“渲染render Field Preview Control”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 render Field Preview Control 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
export function renderFieldPreviewControl(node: DesignerFieldNode): React.ReactElement {
  const renderer = FIELD_PREVIEW_CONTROL_RENDERERS[node.component] ?? InputFieldPreviewControl
  return renderer({ node })
}
