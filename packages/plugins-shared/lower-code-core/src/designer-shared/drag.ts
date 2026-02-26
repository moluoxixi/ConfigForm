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
  /** SortableJS 原始事件（MouseEvent / TouchEvent）。 */
  originalEvent?: Event | null
}

export interface DesignerPointerSnapshot {
  x: number
  y: number
}

export interface DesignerPointerTracker {
  start: () => void
  stop: () => void
  getLastPoint: () => DesignerPointerSnapshot | null
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
  onStart: (event: DesignerSortableEventLike) => void
  onAdd: (event: DesignerSortableEventLike) => void
  onEnd: (event: DesignerSortableEventLike) => void
  setData: (dataTransfer: DataTransfer, dragElement: HTMLElement) => void
  put?: DesignerSortablePutHandler
}

const DESIGNER_SORTABLE_GROUP_NAME = 'configform-lower-code-tree'
const MATERIAL_DRAGGABLE_SELECTOR = '[data-material-id]'
// 允许节点本体或手柄开始拖拽，避免深层节点手柄被遮挡时无法起拖。
const CANVAS_HANDLE_SELECTOR = '.cf-lc-node-tool--move, .cf-lc-node'

export function createDesignerPointerTracker(): DesignerPointerTracker {
  let lastPoint: DesignerPointerSnapshot | null = null
  let listening = false

  const updatePoint = (x: number | null, y: number | null): void => {
    if (x === null || y === null)
      return
    lastPoint = { x, y }
  }

  const handlePointerMove = (event: PointerEvent): void => {
    updatePoint(event.clientX, event.clientY)
  }

  const handleMouseMove = (event: MouseEvent): void => {
    updatePoint(event.clientX, event.clientY)
  }

  const handleTouchMove = (event: TouchEvent): void => {
    const touch = event.touches[0] ?? event.changedTouches[0]
    if (!touch)
      return
    updatePoint(touch.clientX, touch.clientY)
  }

  const start = (): void => {
    if (listening || typeof document === 'undefined')
      return
    listening = true
    lastPoint = null
    document.addEventListener('pointermove', handlePointerMove, true)
    document.addEventListener('mousemove', handleMouseMove, true)
    document.addEventListener('touchmove', handleTouchMove, true)
  }

  const stop = (): void => {
    if (!listening || typeof document === 'undefined')
      return
    document.removeEventListener('pointermove', handlePointerMove, true)
    document.removeEventListener('mousemove', handleMouseMove, true)
    document.removeEventListener('touchmove', handleTouchMove, true)
    listening = false
  }

  return {
    start,
    stop,
    getLastPoint: () => lastPoint,
  }
}

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
  const pointerIndex = resolveDesignerSortablePointerIndex(event)
  if (index >= 0) {
    if (pointerIndex !== null && pointerIndex !== index && event.oldIndex !== undefined && event.oldIndex !== null && index === event.oldIndex)
      return pointerIndex
    return index
  }
  return pointerIndex ?? fallback
}

/**
 * 基于指针位置推算插入索引（兜底方案）。
 */
function resolveDesignerSortablePointerIndex(event: DesignerSortableEventLike): number | null {
  const to = event.to as HTMLElement | null
  if (!to)
    return null
  return resolveDesignerSortablePointerIndexByList(event, to)
}

/**
 * 指定目标列表时，按指针位置计算插入索引。
 */
export function resolveDesignerSortablePointerIndexByTargetKey(
  event: DesignerSortableEventLike,
  targetKey: string | undefined,
): number | null {
  if (!targetKey || typeof document === 'undefined')
    return null
  const escapedKey = typeof CSS !== 'undefined' && typeof CSS.escape === 'function'
    ? CSS.escape(targetKey)
    : targetKey.replace(/"/g, '\\"')
  const list = document.querySelector<HTMLElement>(`[data-cf-drop-list="true"][data-target-key="${escapedKey}"]`)
  if (!list)
    return null
  const pointerY = resolveDesignerSortablePointerClientY(event)
  if (pointerY === null)
    return null
  return resolveDesignerSortablePointerIndexByListWithClientY(list, pointerY, event.item)
}

function resolveDesignerSortablePointerIndexByList(
  event: DesignerSortableEventLike,
  list: HTMLElement,
): number | null {
  const pointerY = resolveDesignerSortablePointerClientY(event)
  if (pointerY === null)
    return null
  return resolveDesignerSortablePointerIndexByListWithClientY(list, pointerY, event.item)
}

function resolveDesignerSortablePointerIndexByListWithClientY(
  list: HTMLElement,
  pointerY: number,
  item?: Element,
): number {
  const children = Array.from(list.children).filter((child) => {
    if (!(child instanceof HTMLElement))
      return false
    if (item && child === item)
      return false
    return child.hasAttribute('data-node-id') || child.hasAttribute('data-material-id')
  })

  for (let index = 0; index < children.length; index++) {
    const rect = children[index].getBoundingClientRect()
    if (pointerY < rect.top + rect.height / 2)
      return index
  }
  return children.length
}

/**
 * 解析指针在视口中的 Y 轴坐标。
 */
function resolveDesignerSortablePointerClientY(event: DesignerSortableEventLike): number | null {
  const originalEvent = event.originalEvent ?? null
  if (!originalEvent)
    return null
  if ('clientY' in originalEvent && typeof (originalEvent as MouseEvent).clientY === 'number')
    return (originalEvent as MouseEvent).clientY
  if ('touches' in originalEvent) {
    const touches = (originalEvent as TouchEvent).touches
    if (touches && touches.length > 0)
      return touches[0].clientY
  }
  if ('changedTouches' in originalEvent) {
    const touches = (originalEvent as TouchEvent).changedTouches
    if (touches && touches.length > 0)
      return touches[0].clientY
  }
  return null
}

/**
 * 解析指针在视口中的 X 轴坐标。
 */
function resolveDesignerSortablePointerClientX(event: DesignerSortableEventLike): number | null {
  const originalEvent = event.originalEvent ?? null
  if (!originalEvent)
    return null
  if ('clientX' in originalEvent && typeof (originalEvent as MouseEvent).clientX === 'number')
    return (originalEvent as MouseEvent).clientX
  if ('touches' in originalEvent) {
    const touches = (originalEvent as TouchEvent).touches
    if (touches && touches.length > 0)
      return touches[0].clientX
  }
  if ('changedTouches' in originalEvent) {
    const touches = (originalEvent as TouchEvent).changedTouches
    if (touches && touches.length > 0)
      return touches[0].clientX
  }
  return null
}

/**
 * 基于坐标定位最合适的投放列表，避免拖拽影子遮挡 elementFromPoint。
 */
function resolveDesignerDropListByPoint(x: number, y: number): HTMLElement | null {
  if (typeof document === 'undefined')
    return null
  const lists = Array.from(document.querySelectorAll<HTMLElement>('[data-cf-drop-list="true"]'))
  const edgeThreshold = 12
  let best: {
    list: HTMLElement
    depth: number
    effectiveDepth: number
    area: number
    edgeDistance: number
  } | null = null
  for (const list of lists) {
    const rect = list.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0)
      continue
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom)
      continue
    let depth = 0
    let parent = list.parentElement
    while (parent) {
      if (parent.matches('[data-cf-drop-list="true"]'))
        depth += 1
      parent = parent.parentElement
    }
    const edgeDistance = Math.min(
      x - rect.left,
      rect.right - x,
      y - rect.top,
      rect.bottom - y,
    )
    const depthPenalty = edgeDistance < edgeThreshold ? 1 : 0
    const effectiveDepth = depth - depthPenalty
    const area = rect.width * rect.height
    if (
      !best
      || effectiveDepth > best.effectiveDepth
      || (effectiveDepth === best.effectiveDepth && edgeDistance > best.edgeDistance)
      || (
        effectiveDepth === best.effectiveDepth
        && edgeDistance === best.edgeDistance
        && area < best.area
      )
    ) {
      best = { list, depth, effectiveDepth, area, edgeDistance }
    }
  }
  return best?.list ?? null
}

/**
 * 根据指针位置推断目标列表 key。
 */
export function resolveDesignerSortablePointerTargetKey(
  event: DesignerSortableEventLike,
): string | null {
  if (typeof document === 'undefined')
    return null
  const clientX = resolveDesignerSortablePointerClientX(event)
  const clientY = resolveDesignerSortablePointerClientY(event)
  if (clientX === null || clientY === null)
    return null
  const list = resolveDesignerDropListByPoint(clientX, clientY)
  return list?.dataset?.targetKey ?? null
}

export function resolveDesignerSortablePointerTargetKeyByPoint(
  point: DesignerPointerSnapshot | null,
): string | null {
  if (!point || typeof document === 'undefined')
    return null
  const list = resolveDesignerDropListByPoint(point.x, point.y)
  return list?.dataset?.targetKey ?? null
}

export function resolveDesignerSortablePointerIndexByTargetKeyAndPoint(
  targetKey: string | undefined,
  point: DesignerPointerSnapshot | null,
  item?: Element,
): number | null {
  if (!point || !targetKey || typeof document === 'undefined')
    return null
  const escapedKey = typeof CSS !== 'undefined' && typeof CSS.escape === 'function'
    ? CSS.escape(targetKey)
    : targetKey.replace(/"/g, '\\"')
  const list = document.querySelector<HTMLElement>(`[data-cf-drop-list="true"][data-target-key="${escapedKey}"]`)
  if (!list)
    return null
  return resolveDesignerSortablePointerIndexByListWithClientY(list, point.y, item)
}

/**
 * 画布列表允许来自任意父目标的节点进入。
 * 最终结构合法性由核心 move 逻辑统一判断。
 */
export function createDesignerCanvasDraggableSelector(_targetKey: string | undefined): string {
  void _targetKey
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
    animation: 160,
    easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
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
  const prefersNativeDrag = typeof window !== 'undefined'
    && (window as unknown as { __CONFIGFORM_NATIVE_DRAG__?: boolean }).__CONFIGFORM_NATIVE_DRAG__ === true
  return {
    group: {
      name: DESIGNER_SORTABLE_GROUP_NAME,
      pull: true,
      put: input.put ?? createDesignerCanvasPutHandler(),
    },
    animation: 180,
    easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
    direction: 'vertical',
    sort: true,
    delayOnTouchOnly: true,
    touchStartThreshold: 4,
    removeCloneOnHide: true,
    swapThreshold: 0.35,
    invertSwap: true,
    dragoverBubble: true,
    filter: (event: Event, target: EventTarget | null) => {
      if (!target || !(target instanceof HTMLElement))
        return false
      if (target.closest('[data-cf-toolbar-interactive="true"]')) {
        // 允许通过“移动手柄”触发拖拽。
        if (target.closest('.cf-lc-node-tool--move'))
          return false
        return true
      }
      const dragEl = target.closest<HTMLElement>('[data-parent-target-key]')
      if (!dragEl)
        return false
      const parentKey = dragEl.dataset.parentTargetKey
      const listKey = input.targetKey
      if (!parentKey || !listKey)
        return false
      return parentKey !== listKey
    },
    emptyInsertThreshold: 24,
    scroll: true,
    bubbleScroll: true,
    scrollSensitivity: 80,
    scrollSpeed: 14,
    forceFallback: !prefersNativeDrag,
    fallbackOnBody: !prefersNativeDrag,
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
