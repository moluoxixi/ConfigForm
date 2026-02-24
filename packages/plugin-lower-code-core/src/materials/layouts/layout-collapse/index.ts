import type { MaterialContainerItem } from '../../../designer'

/**
 * LAYOUT COLLAPSE MATERIAL：变量或常量声明。
 * 所属模块：`packages/plugin-lower-code-core/src/materials/layouts/layout-collapse/index.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export const LAYOUT_COLLAPSE_MATERIAL: MaterialContainerItem = {
  id: 'layout-collapse',
  kind: 'container',
  label: '折叠容器',
  description: '分面板布局',
  component: 'LayoutCollapse',
}
