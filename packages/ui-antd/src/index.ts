import { registerComponent, registerWrapper } from '@moluoxixi/react';
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

/**
 * 注册 Ant Design (React) 全套组件到 ConfigForm
 *
 * @example
 * ```tsx
 * import { setupAntd } from '@moluoxixi/ui-antd';
 * setupAntd();
 * ```
 */
export function setupAntd(): void {
  registerComponent('Input', Input);
  registerComponent('Password', Password);
  registerComponent('Textarea', Textarea);
  registerComponent('InputNumber', InputNumber);
  registerComponent('Select', Select);
  registerComponent('RadioGroup', RadioGroup);
  registerComponent('CheckboxGroup', CheckboxGroup);
  registerComponent('Switch', Switch);
  registerComponent('DatePicker', DatePicker);

  registerWrapper('FormItem', FormItem);
}

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
