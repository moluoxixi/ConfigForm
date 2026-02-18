import type { DesignerNode } from '@moluoxixi/plugin-lower-code-core'
import type { VNodeChild } from 'vue'

export type DesignerFieldPreviewNode = Extract<DesignerNode, { kind: 'field' }>

export type RenderDropList = (
  items: DesignerNode[],
  targetKey: string,
  depth: number,
  emptyText: string,
) => VNodeChild
