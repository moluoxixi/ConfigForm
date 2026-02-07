import { registerComponent, registerWrapper } from '@moluoxixi/vue'
import {
  CheckboxGroup,
  DatePicker,
  FormItem,
  Input,
  InputNumber,
  LayoutCard,
  LayoutFormActions,
  Password,
  RadioGroup,
  Select,
  Switch,
  Textarea,
} from './components'

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
  LayoutCard,
  LayoutFormActions,
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
  LayoutFormActions,
  Password,
  RadioGroup,
  Select,
  Switch,
  Textarea,
} from './components'
