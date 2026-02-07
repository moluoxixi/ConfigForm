import { registerFieldComponents } from '@moluoxixi/react'
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
import {
  PreviewCheckboxGroup,
  PreviewDatePicker,
  PreviewInput,
  PreviewInputNumber,
  PreviewPassword,
  PreviewRadioGroup,
  PreviewSelect,
  PreviewSwitch,
  PreviewTextarea,
} from './components/PreviewText'

/**
 * 注册 Ant Design (React) 全套组件到 ConfigForm
 *
 * 包含 readPretty 映射：阅读态自动替换为 PreviewText 纯文本组件。
 *
 * @example
 * ```tsx
 * import { setupAntd } from '@moluoxixi/ui-antd';
 * setupAntd();
 * ```
 */
export function setupAntd(): void {
  registerFieldComponents(
    { Input, Password, Textarea, InputNumber, Select, RadioGroup, CheckboxGroup, Switch, DatePicker },
    { name: 'FormItem', component: FormItem },
    { LayoutTabs, LayoutCard, LayoutCollapse, LayoutSteps, LayoutStepActions, LayoutFormActions },
    {
      Input: PreviewInput,
      Password: PreviewPassword,
      Textarea: PreviewTextarea,
      InputNumber: PreviewInputNumber,
      Select: PreviewSelect,
      RadioGroup: PreviewRadioGroup,
      CheckboxGroup: PreviewCheckboxGroup,
      Switch: PreviewSwitch,
      DatePicker: PreviewDatePicker,
    },
  )
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
  StatusTabs,
  Switch,
  Textarea,
} from './components'
export type { StatusTabsProps } from './components'
