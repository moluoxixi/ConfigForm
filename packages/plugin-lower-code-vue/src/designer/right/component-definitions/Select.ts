import type { LowCodeDesignerComponentDefinition } from '../../types'

/**
 * Select Definition：变量或常量声明。
 * 所属模块：`packages/plugin-lower-code-vue/src/designer/right/component-definitions/Select.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export const SelectDefinition: LowCodeDesignerComponentDefinition = {
  label: '下拉选择',
  description: '用于单选或多选的选项录入，搭配枚举值进行数据约束。',
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
      key: 'allowClear',
      label: '允许清空',
      editor: 'switch',
      defaultValue: true,
    },
    {
      key: 'mode',
      label: '选择模式',
      editor: 'select',
      options: [
        { label: '单选', value: 'single' },
        { label: '多选', value: 'multiple' },
      ],
      defaultValue: 'single',
    },
  ],
}
