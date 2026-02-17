import type {
  DesignerFieldComponent,
  DesignerFieldNode,
} from '@moluoxixi/plugin-lower-code-core'
import React from 'react'
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

export function renderFieldPreviewControl(node: DesignerFieldNode): React.ReactElement {
  const renderer = FIELD_PREVIEW_CONTROL_RENDERERS[node.component] ?? InputFieldPreviewControl
  return renderer({ node })
}
