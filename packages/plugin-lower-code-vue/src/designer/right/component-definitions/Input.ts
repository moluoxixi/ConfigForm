import type { LowCodeDesignerComponentDefinition } from '../../types'

/**
 * Input Definition：变量或常量声明。
 * 所属模块：`packages/plugin-lower-code-vue/src/designer/right/component-definitions/Input.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
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
      key: 'maxLength',
      label: '最大长度',
      editor: 'number',
    },
    {
      key: 'allowClear',
      label: '允许清空',
      editor: 'switch',
      defaultValue: true,
    },
  ],
}
