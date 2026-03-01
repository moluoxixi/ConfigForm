import type { LowCodeDesignerComponentDefinition } from '../../types'

export const SwitchDefinition: LowCodeDesignerComponentDefinition = {
  label: '开关',
  description: '用于布尔值开关。',
  fieldType: 'boolean',
  defaultProps: {},
  editableProps: [
    {
      key: 'checkedChildren',
      label: '开启文案',
      editor: 'text',
    },
    {
      key: 'unCheckedChildren',
      label: '关闭文案',
      editor: 'text',
    },
    {
      key: 'size',
      label: '尺寸',
      editor: 'select',
      options: [
        { label: '默认', value: '' },
        { label: '小', value: 'small' },
      ],
    },
  ],
}
