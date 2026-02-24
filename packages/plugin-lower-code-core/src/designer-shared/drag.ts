import type { DesignerDropTarget } from '../designer'
import { keyToTarget } from '../designer'

/**
 * 记录当前已经挂载的 Sortable 实例数量。
 * 设计器在异步渲染阶段会重试挂载，这个计数用于判断“挂载是否完成”。
 */
export interface DesignerSortableMountResult {
  materialMounted: number
  canvasMounted: number
}

/**
 * SortableJS `put` 回调需要的最小容器结构。
 */
export interface SortableContainerLike {
  el: Element
}

/**
 * 核心拖拽逻辑实际会用到的 Sortable 事件字段子集。
 */
export interface DesignerSortableEventLike {
  item: Element
  from: Element
  to: Element
  oldIndex?: number | null
  newIndex?: number | null
  oldDraggableIndex?: number | null
  newDraggableIndex?: number | null
}

export type DesignerSortablePutHandler = (
  to: SortableContainerLike,
  from: SortableContainerLike,
  dragEl: Element,
) => boolean

/**
 * 物料列表 Sortable 初始化所需的输入参数。
 */
export interface DesignerMaterialSortableOptionsInput {
  disabled: boolean
  onStart: () => void
  onEnd: () => void
  setData: (dataTransfer: DataTransfer, dragElement: HTMLElement) => void
}

/**
 * 画布区域 Sortable 初始化所需的输入参数。
 */
export interface DesignerCanvasSortableOptionsInput {
  disabled: boolean
  targetKey: string | undefined
  onStart: () => void
  onAdd: (event: DesignerSortableEventLike) => void
  onEnd: (event: DesignerSortableEventLike) => void
  setData: (dataTransfer: DataTransfer, dragElement: HTMLElement) => void
  put?: DesignerSortablePutHandler
}

const DESIGNER_SORTABLE_GROUP_NAME = 'configform-lower-code-tree'
const MATERIAL_DRAGGABLE_SELECTOR = '[data-material-id]'
// 仅允许通过显式移动手柄开始拖拽，避免点击选中与拖拽起手冲突。
const CANVAS_HANDLE_SELECTOR = '.cf-lc-node-tool--move'

/**
 * 判断 Sortable 事件里的索引是否有效（整数且 >= 0）。
 */
function isSortableIndex(value: number | null | undefined): value is number {
  return Number.isInteger(value) && (value as number) >= 0
}

/**
 * 统一解析 old/new 索引。
 * Sortable 在不同模式下会给出不同索引字段，这里按优先级兜底。
 */
export function resolveDesignerSortableIndex(
  event: DesignerSortableEventLike,
  indexType: 'old' | 'new',
): number {
  const fallbackIndex = indexType === 'old' ? event.oldIndex : event.newIndex
  if (isSortableIndex(fallbackIndex))
    return fallbackIndex
  const draggableIndex = indexType === 'old' ? event.oldDraggableIndex : event.newDraggableIndex
  if (isSortableIndex(draggableIndex))
    return draggableIndex
  return -1
}

/**
 * 一次移动操作里，统一拿到 old/new 两个索引。
 */
export function resolveDesignerSortableMoveIndices(
  event: DesignerSortableEventLike,
): { oldIndex: number, newIndex: number } {
  return {
    oldIndex: resolveDesignerSortableIndex(event, 'old'),
    newIndex: resolveDesignerSortableIndex(event, 'new'),
  }
}

/**
 * 解析插入索引，解析失败时使用调用方传入的兜底索引。
 * 典型场景：跨列表拖拽时，Sortable 短暂返回 -1。
 */
export function resolveDesignerSortableInsertIndex(
  event: DesignerSortableEventLike,
  fallback = 0,
): number {
  const index = resolveDesignerSortableIndex(event, 'new')
  return index >= 0 ? index : fallback
}

/**
 * 画布列表允许来自任意父目标的节点进入。
 * 最终结构合法性由核心 move 逻辑统一判断。
 */
export function createDesignerCanvasDraggableSelector(_targetKey: string | undefined): string {
  return '[data-parent-target-key], [data-material-id]'
}

/**
 * Sortable 的 put 闸门函数。
 * 这里保持宽松，保证拖拽指针能进入候选列表；
 * 最终是否允许落位由 `moveNodeByIdToTarget` 决定。
 */
export function createDesignerCanvasPutHandler(
  resolveTarget: (targetKey: string | undefined) => DesignerDropTarget | null = keyToTarget,
): DesignerSortablePutHandler {
  return (to, from, dragEl) => {
    const dragNode = dragEl as HTMLElement
    if (dragNode.dataset.materialId)
      return true
    // 最终落位合法性在 onEnd 阶段由核心 move 逻辑判断；
    // Sortable 层只负责让拖拽进入候选区域。
    void resolveTarget
    void to
    void from
    return true
  }
}

/**
 * 生成“左侧物料列表”的统一 Sortable 配置。
 */
export function createDesignerMaterialSortableOptions(
  input: DesignerMaterialSortableOptionsInput,
): Record<string, unknown> {
  return {
    group: { name: DESIGNER_SORTABLE_GROUP_NAME, pull: 'clone', put: false },
    sort: false,
    animation: 90,
    direction: 'vertical',
    forceFallback: false,
    fallbackOnBody: false,
    fallbackTolerance: 0,
    delayOnTouchOnly: true,
    touchStartThreshold: 4,
    removeCloneOnHide: true,
    disabled: input.disabled,
    draggable: MATERIAL_DRAGGABLE_SELECTOR,
    handle: MATERIAL_DRAGGABLE_SELECTOR,
    ghostClass: 'cf-lc-ghost',
    chosenClass: 'cf-lc-chosen',
    dragClass: 'cf-lc-dragging',
    fallbackClass: 'cf-lc-sortable-fallback',
    onStart: input.onStart,
    onEnd: input.onEnd,
    setData: input.setData,
  }
}

/**
 * 生成“中间画布列表”的统一 Sortable 配置。
 * React/Vue 适配层都应复用这里，避免行为漂移。
 */
export function createDesignerCanvasSortableOptions(
  input: DesignerCanvasSortableOptionsInput,
): Record<string, unknown> {
  return {
    group: {
      name: DESIGNER_SORTABLE_GROUP_NAME,
      pull: true,
      put: input.put ?? createDesignerCanvasPutHandler(),
    },
    animation: 100,
    direction: 'vertical',
    sort: true,
    delayOnTouchOnly: true,
    touchStartThreshold: 4,
    removeCloneOnHide: true,
    swapThreshold: 0.35,
    invertSwap: true,
    dragoverBubble: false,
    emptyInsertThreshold: 24,
    scroll: true,
    bubbleScroll: true,
    scrollSensitivity: 80,
    scrollSpeed: 14,
    forceFallback: true,
    fallbackOnBody: true,
    disabled: input.disabled,
    draggable: createDesignerCanvasDraggableSelector(input.targetKey),
    handle: CANVAS_HANDLE_SELECTOR,
    ghostClass: 'cf-lc-ghost',
    chosenClass: 'cf-lc-chosen',
    dragClass: 'cf-lc-dragging',
    fallbackClass: 'cf-lc-sortable-fallback',
    onStart: input.onStart,
    onAdd: input.onAdd,
    onEnd: input.onEnd,
    setData: input.setData,
  }
}

/**
 * 仅当“物料列表”和“画布列表”都完成挂载时返回 true。
 */
export function hasMountedDesignerSortables(result: DesignerSortableMountResult): boolean {
  return result.materialMounted > 0 && result.canvasMounted > 0
}
