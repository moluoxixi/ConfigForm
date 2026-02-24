import type { DesignerFieldNode, DesignerNode } from '../designer'
import {
  containerTarget,
  containerUsesSections,
  rootTarget,
  sectionTarget,
  targetToKey,
} from '../designer'

/**
 * Drag Restore Event Like：。
 * 所属模块：`packages/plugin-lower-code-core/src/designer-shared/utils.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export interface DragRestoreEventLike {
  item: Element | null
  from: Element | null
  oldIndex?: number | null
}

/**
 * collect Preview Fields：。
 * 所属模块：`packages/plugin-lower-code-core/src/designer-shared/utils.ts`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param nodes 参数 `nodes`用于提供节点数据并定位或更新目标节点。
 * @returns 返回数组结果，用于后续遍历、渲染或进一步转换。
 */
export function collectPreviewFields(nodes: DesignerNode[]): DesignerFieldNode[] {
  const fields: DesignerFieldNode[] = []
  /**
   * walk：。
   * 所属模块：`packages/plugin-lower-code-core/src/designer-shared/utils.ts`。
   * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
   * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
   * @param items 参数 `items`用于提供集合数据，支撑批量遍历与扩展处理。
   */
  const /**
         * walk：执行当前功能逻辑。
         *
         * @param items 参数 items 的输入说明。
         */
    walk = (items: DesignerNode[]): void => {
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
 * collect Drop Target Keys：。
 * 所属模块：`packages/plugin-lower-code-core/src/designer-shared/utils.ts`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param nodes 参数 `nodes`用于提供节点数据并定位或更新目标节点。
 * @returns 返回数组结果，用于后续遍历、渲染或进一步转换。
 */
export function collectDropTargetKeys(nodes: DesignerNode[]): string[] {
  const keys = [targetToKey(rootTarget())]
  /**
   * walk：。
   * 所属模块：`packages/plugin-lower-code-core/src/designer-shared/utils.ts`。
   * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
   * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
   * @param items 参数 `items`用于提供集合数据，支撑批量遍历与扩展处理。
   */
  const /**
         * walk：执行当前功能逻辑。
         *
         * @param items 参数 items 的输入说明。
         */
    walk = (items: DesignerNode[]): void => {
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
 * restore Dragged Dom Position：。
 * 所属模块：`packages/plugin-lower-code-core/src/designer-shared/utils.ts`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param event 参数 `event`用于传递事件上下文，使逻辑能基于交互状态进行处理。
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
