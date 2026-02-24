import { FormLayout, registerActions, registerFieldComponents } from '@moluoxixi/vue'
import {
  ArrayField,
  ArrayItems,
  ArrayTable,
  AutoComplete,
  Cascader,
  CheckboxGroup,
  DatePicker,
  DateRangePicker,
  ExportJsonAction,
  FormItem,
  ImportJsonAction,
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
  PrintAction,
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
import 'element-plus/dist/index.css'

let styleInjected = false

/**
 * inject Label Align Style：封装该模块的核心渲染与交互逻辑。
 * 所属模块：`packages/ui-element-plus/src/index.ts`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 */
function injectLabelAlignStyle(): void {
  if (styleInjected || typeof document === 'undefined')
    return
  styleInjected = true
  const style = document.createElement('style')
  style.textContent = `
    /* ConfigForm: Element Plus label 默认右对齐（对齐 antd-vue 行为） */
    .el-form-item .el-form-item__label {
      justify-content: flex-end;
      text-align: right;
    }
  `
  document.head.appendChild(style)
}

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
  injectLabelAlignStyle()
  registerFieldComponents(
    { Input, Password, Textarea, InputNumber, Select, RadioGroup, CheckboxGroup, Switch, DatePicker, DateRangePicker, Cascader, TreeSelect, Upload, Transfer, TimePicker, AutoComplete, Mentions, Rate, Slider, MonthPicker, WeekPicker, YearPicker, RangePicker, ArrayItems, ArrayField },
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
  registerActions({
    export: ExportJsonAction,
    import: ImportJsonAction,
    print: PrintAction,
  })
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
  DateRangePicker,
  ExportJsonAction,
  FormDialog,
  FormDrawer,
  FormItem,
  ImportJsonAction,
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
  PrintAction,
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
export type {
  ExportJsonActionProps,
  FileInfo,
  ImportJsonActionProps,
  PrintActionProps,
} from './components'
