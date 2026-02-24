import type { MaterialFieldItem } from '../../../designer'

/**
 * DATE MATERIAL：变量或常量声明。
 * 所属模块：`packages/plugin-lower-code-core/src/materials/components/date/index.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export const DATE_MATERIAL: MaterialFieldItem = {
  id: 'date',
  kind: 'field',
  label: '日期',
  description: '日期选择',
  type: 'date',
  component: 'DatePicker',
}
