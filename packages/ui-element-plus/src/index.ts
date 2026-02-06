import { registerComponent, registerWrapper } from '@moluoxixi/vue'
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

/** 组件名 → 组件映射表 */
export const componentMapping = {
  Input,
  Password,
  Textarea,
  InputNumber,
  Select,
  RadioGroup,
  CheckboxGroup,
  Switch,
  DatePicker,
  FormItem,
} as const

/**
 * 注册 Element Plus 全套组件到 ConfigForm
 *
 * @example
 * ```ts
 * import { setupElementPlus } from '@moluoxixi/ui-element-plus';
 * setupElementPlus();
 * ```
 */
export function setupElementPlus(): void {
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
