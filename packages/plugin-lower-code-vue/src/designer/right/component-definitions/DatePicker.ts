import type { LowCodeDesignerComponentDefinition } from '../../types'

export const DatePickerDefinition: LowCodeDesignerComponentDefinition = {
  label: '日期选择',
  description: '用于日期输入，适合生效时间、截止时间、排期等日期类字段。',
  fieldType: 'date',
  defaultProps: {
    placeholder: '请选择日期',
    format: 'YYYY-MM-DD',
  },
  editableProps: [
    {
      key: 'placeholder',
      label: '占位提示',
      editor: 'text',
      defaultValue: '请选择日期',
    },
    {
      key: 'format',
      label: '日期格式',
      editor: 'text',
      defaultValue: 'YYYY-MM-DD',
    },
  ],
}
