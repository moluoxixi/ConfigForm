import { registerComponent, registerWrapper } from '@moluoxixi/react'
import {
  CheckboxGroup,
  DatePicker,
  FormItem,
  Input,
  InputNumber,
  LayoutCard,
  LayoutCollapse,
  LayoutFormActions,
  LayoutStepActions,
  LayoutSteps,
  LayoutTabs,
  Password,
  RadioGroup,
  Select,
  Switch,
  Textarea,
} from './components'

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

  /* 布局组件 */
  registerComponent('LayoutTabs', LayoutTabs)
  registerComponent('LayoutCard', LayoutCard)
  registerComponent('LayoutCollapse', LayoutCollapse)
  registerComponent('LayoutSteps', LayoutSteps)
  registerComponent('LayoutStepActions', LayoutStepActions)
  registerComponent('LayoutFormActions', LayoutFormActions)

  registerWrapper('FormItem', FormItem)
}

export {
  CheckboxGroup,
  DatePicker,
  FormItem,
  Input,
  InputNumber,
  LayoutCard,
  LayoutCollapse,
  LayoutFormActions,
  LayoutStepActions,
  LayoutSteps,
  LayoutTabs,
  Password,
  RadioGroup,
  Select,
  Switch,
  Textarea,
} from './components'
