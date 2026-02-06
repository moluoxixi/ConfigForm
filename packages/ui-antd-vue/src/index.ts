import { registerComponent, registerWrapper } from '@moluoxixi/vue';
import {
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
} from './adapter';

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
} as const;

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
  /* 注册字段组件 */
  registerComponent('Input', Input);
  registerComponent('Password', Password);
  registerComponent('Textarea', Textarea);
  registerComponent('InputNumber', InputNumber);
  registerComponent('Select', Select);
  registerComponent('RadioGroup', RadioGroup);
  registerComponent('CheckboxGroup', CheckboxGroup);
  registerComponent('Switch', Switch);
  registerComponent('DatePicker', DatePicker);

  /* 注册装饰器 */
  registerWrapper('FormItem', FormItem);
}

/* 导出所有组件（方便按需使用） */
export {
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
} from './adapter';
