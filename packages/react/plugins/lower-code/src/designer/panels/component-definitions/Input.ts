import type { LowCodeDesignerComponentDefinition } from '../../types'

export const InputDefinition: LowCodeDesignerComponentDefinition = {
  label: '输入框',
  description: '用于单行文本输入，适合账号、标题、关键字等短文本。',
  fieldType: 'string',
  defaultProps: {
    placeholder: '请输入',
  },
  editableProps: [
    {
      key: 'placeholder',
      label: '占位提示',
      editor: 'text',
      defaultValue: '请输入',
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
      key: 'maxLength',
      label: '最大长度',
      editor: 'number',
    },
    {
      key: 'showCount',
      label: '显示字数',
      editor: 'switch',
    },
    {
      key: 'allowClear',
      label: '允许清空',
      editor: 'switch',
      defaultValue: true,
    },
  ],
}
