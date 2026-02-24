import type { DesignerNode } from '@moluoxixi/plugin-lower-code-core'
import type { VNodeChild } from 'vue'

/**
 * Designer Field Preview Node：。
 * 所属模块：`packages/plugin-lower-code-vue/src/designer/center/DesignerCanvasPane/types.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export type DesignerFieldPreviewNode = Extract<DesignerNode, { kind: 'field' }>

/**
 * Render Drop List：。
 * 所属模块：`packages/plugin-lower-code-vue/src/designer/center/DesignerCanvasPane/types.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export type RenderDropList = (
  items: DesignerNode[],
  targetKey: string,
  depth: number,
  emptyText: string,
) => VNodeChild
