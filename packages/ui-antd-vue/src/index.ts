import { FormLayout, registerFieldComponents } from '@moluoxixi/vue'
import {
  ArrayField,
  ArrayItems,
  ArrayTable,
  AutoComplete,
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
  Mentions,
  MonthPicker,
  Password,
  RadioGroup,
  RangePicker,
  Rate,
  Select,
  Slider,
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
 * 注册 Ant Design Vue 全套组件到 ConfigForm
 *
 * 包含 readPretty 映射：阅读态自动替换为 PreviewText 纯文本组件。
 *
 * @example
 * ```ts
 * import { setupAntdVue } from '@moluoxixi/ui-antd-vue';
 * setupAntdVue();
 * ```
 */
export function setupAntdVue(): void {
  registerFieldComponents(
    { Input, Password, Textarea, InputNumber, Select, RadioGroup, CheckboxGroup, Switch, DatePicker, Cascader, TimePicker, Transfer, TreeSelect, Upload, ArrayItems, ArrayField, AutoComplete, Mentions, Rate, Slider, MonthPicker, WeekPicker, YearPicker, RangePicker },
    { name: 'FormItem', component: FormItem },
    { ArrayTable, FormLayout, LayoutTabs, LayoutCard, LayoutCollapse, LayoutSteps, LayoutStepActions, LayoutFormActions, StatusTabs },
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

/* 导出所有组件（按需使用） */
export {
  ArrayBase,
  ArrayField,
  ArrayItems,
  ArrayTable,
  AutoComplete,
  Cascader,
  CheckboxGroup,
  DatePicker,
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
