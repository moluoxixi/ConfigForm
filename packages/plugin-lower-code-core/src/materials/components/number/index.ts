import type { MaterialFieldItem } from '../../../designer'

export const NUMBER_MATERIAL: MaterialFieldItem = {
  id: 'number',
  kind: 'field',
  label: '数字输入',
  description: '金额/数量',
  type: 'number',
  component: 'InputNumber',
}
