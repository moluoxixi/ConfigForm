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
 * 注册 Ant Design Vue 全套组件到 ConfigForm
 *
 * @example
 * ```ts
 * import { setupAntdVue } from '@moluoxixi/ui-antd-vue';
 * setupAntdVue();
 * ```
 */
export function setupAntdVue(): void {
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
  registerComponent('LayoutTabs', LayoutTabs)
  registerComponent('LayoutCard', LayoutCard)
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
