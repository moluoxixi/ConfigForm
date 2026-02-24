import type { MaterialFieldItem } from '../../../designer'

/**
 * NUMBER MATERIAL：变量或常量声明。
 * 所属模块：`packages/plugin-lower-code-core/src/materials/components/number/index.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export const NUMBER_MATERIAL: MaterialFieldItem = {
  id: 'number',
  kind: 'field',
  label: '数字输入',
  description: '金额/数量',
  type: 'number',
  component: 'InputNumber',
}
