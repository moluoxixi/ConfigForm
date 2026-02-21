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

/**
 * collect Preview Fields：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 collect Preview Fields 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
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

/**
 * collect Drop Target Keys：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 collect Drop Target Keys 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
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
 * restore Dragged Dom Position：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 restore Dragged Dom Position 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
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
