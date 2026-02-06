import { registerComponent, registerWrapper } from '@moluoxixi/react'
import {
  CheckboxGroup,
  DatePicker,
  FormItem,
  Input,
  InputNumber,
  Password,
  RadioGroup,
  Select,
  Switch,
  Textarea,
} from './adapter'

/**
 * 注册 Ant Design (React) 全套组件到 ConfigForm
 *
 * @example
 * ```tsx
 * import { setupAntd } from '@moluoxixi/ui-antd';
 * setupAntd();
 * ```
 */
export function setupAntd(): void {
  registerComponent('Input', Input)
  registerComponent('Password', Password)
  registerComponent('Textarea', Textarea)
  registerComponent('InputNumber', InputNumber)
  registerComponent('Select', Select)
  registerComponent('RadioGroup', RadioGroup)
  registerComponent('CheckboxGroup', CheckboxGroup)
  registerComponent('Switch', Switch)
  registerComponent('DatePicker', DatePicker)

  registerWrapper('FormItem', FormItem)
}

export {
  CheckboxGroup,
  DatePicker,
  FormItem,
  Input,
  InputNumber,
  Password,
  RadioGroup,
  Select,
  Switch,
  Textarea,
} from './adapter'
