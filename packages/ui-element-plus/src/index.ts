import 'element-plus/dist/index.css'
import { ArrayItems, ArrayTable, registerFieldComponents } from '@moluoxixi/vue'
import {
  Cascader,
  CheckboxGroup,
  DatePicker,
  DateRangePicker,
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

/** 注入 Element Plus FormItem 标签右对齐全局样式（仅注入一次） */
let styleInjected = false
function injectLabelAlignStyle(): void {
  if (styleInjected || typeof document === 'undefined') return
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
    { Input, Password, Textarea, InputNumber, Select, RadioGroup, CheckboxGroup, Switch, DatePicker, DateRangePicker, Cascader, TreeSelect, Upload, Transfer, TimePicker, ArrayItems },
    { name: 'FormItem', component: FormItem },
    { ArrayTable, LayoutTabs, LayoutCard, LayoutCollapse, LayoutSteps, LayoutStepActions, LayoutFormActions },
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
  Cascader,
  CheckboxGroup,
  DatePicker,
  DateRangePicker,
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
export type { FileInfo } from './components'
