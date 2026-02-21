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

/**
 * 注入 Element Plus FormItem 标签右对齐全局样式（仅注入一次）
 * inject Label Align Style：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 inject Label Align Style 的单一职责，调用方可通过函数名快速理解输入输出语义。
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
