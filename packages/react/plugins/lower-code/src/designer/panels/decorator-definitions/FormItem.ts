import type { LowCodeDesignerDecoratorDefinition } from '../../types'

export const FormItemDefinition: LowCodeDesignerDecoratorDefinition = {
  label: '表单项',
  description: '字段装饰器，负责 label、布局与校验提示。',
  defaultProps: {
    colon: true,
  },
  editableProps: [
    {
      key: 'labelPosition',
      label: '标签位置',
      editor: 'select',
      options: [
        { label: '继承', value: '' },
        { label: '上', value: 'top' },
        { label: '左', value: 'left' },
        { label: '右', value: 'right' },
      ],
    },
    {
      key: 'labelWidth',
      label: '标签宽度',
      editor: 'text',
      description: '支持 120 或 120px',
    },
    {
      key: 'colon',
      label: '显示冒号',
      editor: 'switch',
      defaultValue: true,
    },
    {
      key: 'pattern',
      label: '表单模式',
      editor: 'select',
      options: [
        { label: '可编辑', value: 'editable' },
        { label: '预览', value: 'preview' },
        { label: '禁用', value: 'disabled' },
      ],
    },
  ],
}
