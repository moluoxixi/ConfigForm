import { ArrayItems, ArrayTable, registerFieldComponents } from '@moluoxixi/react'
import {
  Cascader,
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
  TimePicker,
  Transfer,
  TreeSelect,
  Upload,
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
    { Input, Password, Textarea, InputNumber, Select, RadioGroup, CheckboxGroup, Switch, DatePicker, TimePicker, TreeSelect, Cascader, Transfer, Upload },
    { name: 'FormItem', component: FormItem },
    { ArrayItems, ArrayTable, LayoutTabs, LayoutCard, LayoutCollapse, LayoutSteps, LayoutStepActions, LayoutFormActions },
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
  Cascader,
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
  TimePicker,
  Transfer,
  TreeSelect,
  Upload,
} from './components'
export type { StatusTabsProps } from './components'
