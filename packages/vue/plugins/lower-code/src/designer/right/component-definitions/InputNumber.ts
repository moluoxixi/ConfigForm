import type { LowCodeDesignerComponentDefinition } from '../../types'

/**
 * Input Number Definition：。
 * 所属模块：`packages/plugin-lower-code-vue/src/designer/right/component-definitions/InputNumber.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
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
    {
      key: 'controls',
      label: '显示步进按钮',
      editor: 'switch',
      defaultValue: true,
    },
  ],
}
