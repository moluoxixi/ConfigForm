import type { LowCodeDesignerComponentDefinition } from '../../types'

export const SelectDefinition: LowCodeDesignerComponentDefinition = {
  label: '下拉选择',
  description: '用于选择枚举数据，支持单选/多选与搜索。',
  fieldType: 'string',
  defaultProps: {
    placeholder: '请选择',
    allowClear: true,
  },
  editableProps: [
    {
      key: 'placeholder',
      label: '占位提示',
      editor: 'text',
      defaultValue: '请选择',
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
      key: 'allowClear',
      label: '允许清空',
      editor: 'switch',
      defaultValue: true,
    },
    {
      key: 'showSearch',
      label: '允许搜索',
      editor: 'switch',
      defaultValue: true,
    },
    {
      key: 'mode',
      label: '选择模式',
      editor: 'select',
      options: [
        { label: '单选', value: '' },
        { label: '多选', value: 'multiple' },
        { label: '标签', value: 'tags' },
      ],
    },
  ],
}
