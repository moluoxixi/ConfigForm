import { registerComponent, registerWrapper } from '@moluoxixi/vue'
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
 * 注册 Element Plus 全套组件到 ConfigForm
 *
 * @example
 * ```ts
 * import { setupElementPlus } from '@moluoxixi/ui-element-plus';
 * setupElementPlus();
 * ```
 */
export function setupElementPlus(): void {
  /* 字段组件 */
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
  registerComponent('LayoutCard', LayoutCard)
  registerComponent('LayoutTabs', LayoutTabs)
  registerComponent('LayoutCollapse', LayoutCollapse)
  registerComponent('LayoutSteps', LayoutSteps)
  registerComponent('LayoutStepActions', LayoutStepActions)
  registerComponent('LayoutFormActions', LayoutFormActions)

  /* 装饰器 */
  registerWrapper('FormItem', FormItem)
}

/* 导出所有组件（按需使用） */
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
