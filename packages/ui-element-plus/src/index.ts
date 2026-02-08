import { ArrayItems, registerFieldComponents } from '@moluoxixi/vue'
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
  StatusTabs,
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
  registerFieldComponents(
    { Input, Password, Textarea, InputNumber, Select, RadioGroup, CheckboxGroup, Switch, DatePicker, ArrayItems },
    { name: 'FormItem', component: FormItem },
    { LayoutTabs, LayoutCard, LayoutCollapse, LayoutSteps, LayoutStepActions, LayoutFormActions },
  )
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
  StatusTabs,
  Switch,
  Textarea,
} from './components'
