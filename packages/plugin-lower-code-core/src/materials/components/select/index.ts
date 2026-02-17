import type { MaterialFieldItem } from '../../../designer'

export const SELECT_MATERIAL: MaterialFieldItem = {
  id: 'select',
  kind: 'field',
  label: '下拉选择',
  description: '枚举选项',
  type: 'string',
  component: 'Select',
}
