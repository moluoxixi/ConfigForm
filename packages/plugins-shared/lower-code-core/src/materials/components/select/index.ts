import type { MaterialFieldItem } from '../../../designer'

/**
 * SELECT MATERIAL：。
 * 所属模块：`packages/plugin-lower-code-core/src/materials/components/select/index.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export const SELECT_MATERIAL: MaterialFieldItem = {
  id: 'select',
  kind: 'field',
  label: '下拉选择',
  description: '枚举选项',
  type: 'string',
  component: 'Select',
}
