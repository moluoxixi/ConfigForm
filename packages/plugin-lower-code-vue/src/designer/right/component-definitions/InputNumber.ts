import type { LowCodeDesignerComponentDefinition } from '../../types'

export const InputNumberDefinition: LowCodeDesignerComponentDefinition = {
  label: '数字输入',
  description: '用于整数或小数输入，适合金额、数量、权重等数值场景。',
  fieldType: 'number',
  defaultProps: {
    precision: 0,
    step: 1,
  },
  editableProps: [
    {
      key: 'min',
      label: '最小值',
      editor: 'number',
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
      label: '小数位',
      editor: 'number',
      defaultValue: 0,
    },
  ],
}
