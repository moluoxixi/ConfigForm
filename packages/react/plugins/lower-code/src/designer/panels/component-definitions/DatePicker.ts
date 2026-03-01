import type { LowCodeDesignerComponentDefinition } from '../../types'

export const DatePickerDefinition: LowCodeDesignerComponentDefinition = {
  label: '日期选择',
  description: '用于日期选择，支持格式配置。',
  fieldType: 'date',
  defaultProps: {
    placeholder: '请选择日期',
  },
  editableProps: [
    {
      key: 'placeholder',
      label: '占位提示',
      editor: 'text',
      defaultValue: '请选择日期',
    },
    {
      key: 'size',
      label: '尺寸',
      editor: 'select',
      options: [
        { label: '默认', value: '' },
        { label: '小', value: 'small' },
        { label: '中', value: 'middle' },
        { label: '大', value: 'large' },
      ],
    },
    {
      key: 'format',
      label: '显示格式',
      editor: 'text',
      defaultValue: 'YYYY-MM-DD',
    },
    {
      key: 'showTime',
      label: '显示时间',
      editor: 'switch',
    },
  ],
}
