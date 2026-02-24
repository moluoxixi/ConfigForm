import type { MaterialFieldItem } from '../../../designer'

/**
 * TEXTAREA MATERIAL：。
 * 所属模块：`packages/plugin-lower-code-core/src/materials/components/textarea/index.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export const TEXTAREA_MATERIAL: MaterialFieldItem = {
  id: 'textarea',
  kind: 'field',
  label: '多行输入',
  description: '大文本输入',
  type: 'string',
  component: 'Textarea',
}
