import type { DesignerFieldNode, DesignerNode } from '../designer'
import {
  containerTarget,
  containerUsesSections,
  rootTarget,
  sectionTarget,
  targetToKey,
} from '../designer'

export interface DragRestoreEventLike {
  item: Element | null
  from: Element | null
  oldIndex?: number | null
}

export function collectPreviewFields(nodes: DesignerNode[]): DesignerFieldNode[] {
  const fields: DesignerFieldNode[] = []
  const walk = (items: DesignerNode[]): void => {
    for (const item of items) {
      if (item.kind === 'field') {
        fields.push(item)
        continue
      }
      if (containerUsesSections(item.component)) {
        for (const section of item.sections)
          walk(section.children)
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

export function restoreDraggedDomPosition(event: DragRestoreEventLike): void {
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
