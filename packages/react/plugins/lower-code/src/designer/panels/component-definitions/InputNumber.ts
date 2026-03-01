import type { LowCodeDesignerComponentDefinition } from '../../types'

export const InputNumberDefinition: LowCodeDesignerComponentDefinition = {
  label: '数字输入',
  description: '用于数值输入，支持最小/最大值与步进。',
  fieldType: 'number',
  defaultProps: {
    min: 0,
  },
  editableProps: [
    {
      key: 'min',
      label: '最小值',
      editor: 'number',
      defaultValue: 0,
    },
    {
      key: 'max',
      label: '最大值',
      editor: 'number',
    },
    {
      key: 'step',
      label: '步长',
      editor: 'number',
      defaultValue: 1,
    },
    {
      key: 'precision',
      label: '精度',
      editor: 'number',
    },
    {
      key: 'controls',
      label: '显示步进按钮',
      editor: 'switch',
      defaultValue: true,
    },
  ],
}
