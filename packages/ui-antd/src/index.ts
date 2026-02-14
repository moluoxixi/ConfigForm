import { FormLayout, registerFieldComponents } from '@moluoxixi/react'
import {
  ArrayCards,
  ArrayCollapse,
  ArrayField,
  ArrayItems,
  ArrayTable,
  AutoComplete,
  Cascader,
  CheckboxGroup,
  DatePicker,
  Editable,
  EditablePopover,
  FormItem,
  Input,
  InputNumber,
  LayoutCard,
  LayoutCollapse,
  LayoutFormActions,
  LayoutStepActions,
  LayoutSteps,
  LayoutTabs,
  Mentions,
  MonthPicker,
  Password,
  RadioGroup,
  RangePicker,
  Rate,
  Select,
  Slider,
  Space,
  StatusTabs,
  Switch,
  Textarea,
  TimePicker,
  Transfer,
  TreeSelect,
  Upload,
  WeekPicker,
  YearPicker,
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
    { Input, Password, Textarea, InputNumber, Select, RadioGroup, CheckboxGroup, Switch, DatePicker, TimePicker, TreeSelect, Cascader, Transfer, Upload, AutoComplete, Mentions, Rate, Slider, RangePicker, MonthPicker, WeekPicker, YearPicker },
    { name: 'FormItem', component: FormItem },
    { ArrayCards, ArrayCollapse, ArrayField, ArrayItems, ArrayTable, Editable, EditablePopover, FormLayout, LayoutTabs, LayoutCard, LayoutCollapse, LayoutSteps, LayoutStepActions, LayoutFormActions, StatusTabs, Space },
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
  ArrayBase,
  ArrayCards,
  ArrayCollapse,
  ArrayField,
  ArrayItems,
  ArrayTable,
  AutoComplete,
  Cascader,
  CheckboxGroup,
  DatePicker,
  Editable,
  EditablePopover,
  FormDialog,
  FormDrawer,
  FormItem,
  Input,
  InputNumber,
  LayoutCard,
  LayoutCollapse,
  LayoutFormActions,
  LayoutStepActions,
  LayoutSteps,
  LayoutTabs,
  Mentions,
  MonthPicker,
  Password,
  RadioGroup,
  RangePicker,
  Rate,
  Select,
  Slider,
  Space,
  StatusTabs,
  Switch,
  Textarea,
  TimePicker,
  Transfer,
  TreeSelect,
  Upload,
  WeekPicker,
  YearPicker,
} from './components'
export type { FormDialogOpenOptions, FormDialogProps, FormDrawerOpenOptions, FormDrawerProps, StatusTabsProps } from './components'
