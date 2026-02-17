import type { DesignerFieldNode, DesignerNode } from '@moluoxixi/plugin-lower-code-core'
import Sortable from 'sortablejs'
import {
  containerTarget,
  containerUsesSections,
  isFieldNode,
  rootTarget,
  sectionTarget,
  targetToKey,
} from '@moluoxixi/plugin-lower-code-core'

export function collectPreviewFields(nodes: DesignerNode[]): DesignerFieldNode[] {
  const fields: DesignerFieldNode[] = []
  const walk = (items: DesignerNode[]): void => {
    for (const item of items) {
      if (isFieldNode(item)) {
        fields.push(item)
        continue
      }
      if (containerUsesSections(item.component)) {
        for (const section of item.sections) {
          walk(section.children)
        }
        continue
      }
      walk(item.children)
    }
  }
  walk(nodes)
  return fields
}

export function collectDropTargetKeys(nodes: DesignerNode[]): string[] {
  const keys = [targetToKey(rootTarget())]
  const walk = (items: DesignerNode[]): void => {
    for (const item of items) {
      if (item.kind !== 'container')
        continue
      if (containerUsesSections(item.component)) {
        for (const section of item.sections) {
          keys.push(targetToKey(sectionTarget(section.id)))
          walk(section.children)
        }
        continue
      }
      keys.push(targetToKey(containerTarget(item.id)))
      walk(item.children)
    }
  }
  walk(nodes)
  return keys
}

/**
 * Sortable 会直接改 DOM，React 需要先把 DOM 放回旧位置，再由 state 驱动重渲染。
 */
export function restoreDraggedDomPosition(event: Sortable.SortableEvent): void {
  const item = event.item as HTMLElement | null
  const from = event.from as HTMLElement | null
  if (!item || !from)
    return

  const oldIndex = event.oldIndex ?? -1
  if (oldIndex < 0)
    return

  const siblings = Array.from(from.children).filter(child => child !== item)
  if (oldIndex >= siblings.length) {
    from.appendChild(item)
    return
  }
  const anchor = siblings[oldIndex]
  if (anchor)
    from.insertBefore(item, anchor)
  else
    from.appendChild(item)
}
