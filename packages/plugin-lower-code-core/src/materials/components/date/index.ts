import type { MaterialFieldItem } from '../../../designer'

export const DATE_MATERIAL: MaterialFieldItem = {
  id: 'date',
  kind: 'field',
  label: '日期',
  description: '日期选择',
  type: 'date',
  component: 'DatePicker',
}
