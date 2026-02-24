import type { LowCodeDesignerComponentDefinition } from '../../types'

/**
 * Switch Definition：。
 * 所属模块：`packages/plugin-lower-code-vue/src/designer/right/component-definitions/Switch.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export const SwitchDefinition: LowCodeDesignerComponentDefinition = {
  label: '开关',
  description: '用于布尔状态切换，适合启用、开关、状态控制类配置。',
  fieldType: 'boolean',
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
  ],
}
