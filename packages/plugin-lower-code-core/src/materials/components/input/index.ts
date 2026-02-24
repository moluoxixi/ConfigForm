import type { MaterialFieldItem } from '../../../designer'

/**
 * INPUT MATERIAL：变量或常量声明。
 * 所属模块：`packages/plugin-lower-code-core/src/materials/components/input/index.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export const INPUT_MATERIAL: MaterialFieldItem = {
  id: 'input',
  kind: 'field',
  label: '单行输入',
  description: '文本输入',
  type: 'string',
  component: 'Input',
}
