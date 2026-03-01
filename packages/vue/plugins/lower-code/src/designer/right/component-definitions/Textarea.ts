import type { LowCodeDesignerComponentDefinition } from '../../types'

/**
 * Textarea Definition：。
 * 所属模块：`packages/plugin-lower-code-vue/src/designer/right/component-definitions/Textarea.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export const TextareaDefinition: LowCodeDesignerComponentDefinition = {
  label: '多行文本',
  description: '用于长文本录入，适合备注、描述、意见反馈等场景。',
  fieldType: 'string',
  defaultProps: {
    placeholder: '请输入',
    rows: 4,
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
      key: 'rows',
      label: '默认行数',
      editor: 'number',
      defaultValue: 4,
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
      key: 'autoSize',
      label: '自适应高度',
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
