import type { BubblePosition } from './types'
import {
  BUBBLE_MARGIN,
  BUBBLE_SIZE,
  PANEL_MAX_HEIGHT,
  RIGHT_DOCK_SCROLLBAR_FALLBACK,
} from './constants'

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function viewportWidth(): number {
  return Math.max(BUBBLE_SIZE, window.innerWidth || document.documentElement.clientWidth || BUBBLE_SIZE)
}

export function viewportHeight(): number {
  return Math.max(BUBBLE_SIZE, window.innerHeight || document.documentElement.clientHeight || BUBBLE_SIZE)
}

export function rightDockScrollbarWidth(): number {
  const width = window.innerWidth || 0
  const clientWidth = document.documentElement.clientWidth || 0

  if (width > 0 && clientWidth > 0 && width > clientWidth)
    return width - clientWidth

  const clientHeight = document.documentElement.clientHeight || window.innerHeight || 0
  if (document.documentElement.scrollHeight > clientHeight)
    return RIGHT_DOCK_SCROLLBAR_FALLBACK

  return 0
}

export function rightDockViewportEdge(): number {
  return viewportWidth() - rightDockScrollbarWidth()
}

export function panelViewportHeight(): number {
  return Math.max(BUBBLE_SIZE, viewportHeight() - BUBBLE_MARGIN * 2)
}

export function resolvePanelHeight(panel: HTMLElement): number {
  const height = panel.getBoundingClientRect().height
  if (height > 0)
    return Math.min(height, panelViewportHeight())

  return Math.min(PANEL_MAX_HEIGHT, panelViewportHeight())
}

export function resolvePanelTop(panel: HTMLElement, position: BubblePosition): number {
  const panelHeight = resolvePanelHeight(panel)
  const minTop = BUBBLE_MARGIN
  const maxTop = Math.max(minTop, viewportHeight() - BUBBLE_MARGIN - panelHeight)
  const aboveTop = position.top - panelHeight - BUBBLE_MARGIN
  const belowTop = position.top + BUBBLE_SIZE + BUBBLE_MARGIN
  const bottomLimit = viewportHeight() - BUBBLE_MARGIN

  if (position.top + BUBBLE_SIZE / 2 > viewportHeight() / 2 && aboveTop >= minTop)
    return clamp(aboveTop, minTop, maxTop)

  if (belowTop + panelHeight <= bottomLimit)
    return clamp(belowTop, minTop, maxTop)

  if (aboveTop >= minTop)
    return clamp(aboveTop, minTop, maxTop)

  return clamp(position.top - 300, minTop, maxTop)
}

export function compareElementsByDocumentPosition(first: HTMLElement, second: HTMLElement): number {
  if (first === second)
    return 0

  const position = first.compareDocumentPosition(second)
  if (position & Node.DOCUMENT_POSITION_FOLLOWING)
    return -1
  if (position & Node.DOCUMENT_POSITION_PRECEDING)
    return 1
  return 0
}

export function selectEarlierElement(current: HTMLElement | undefined, next: HTMLElement | null): HTMLElement | undefined {
  if (!next)
    return current
  if (!current)
    return next
  return compareElementsByDocumentPosition(next, current) < 0 ? next : current
}

/**
 * 判断元素或祖先节点是否被显式隐藏，不应参与自动巡检。
 *
 * display:none/v-show 表单仍会留在导航中显示为禁用项，但不会自动成为当前表单。
 */
export function elementIsHiddenByState(element: HTMLElement): boolean {
  for (let current: HTMLElement | null = element; current; current = current.parentElement) {
    if (
      current.hidden
      || current.hasAttribute('inert')
      || current.getAttribute('aria-hidden') === 'true'
      || current.dataset.cfDevtoolsActive === 'false'
    ) {
      return true
    }

    const style = window.getComputedStyle(current)
    if (style.display === 'none' || style.visibility === 'hidden' || style.visibility === 'collapse')
      return true
  }

  return false
}

export function elementHasEnabledBox(element: HTMLElement): boolean {
  if (elementIsHiddenByState(element))
    return false

  const rect = element.getBoundingClientRect()
  return rect.width > 0 && rect.height > 0
}

/**
 * 计算元素在当前视口中的可见强度。
 *
 * 可见面积是主信号；距离视口顶部的距离只作为并列时的排序因素，
 * 让堆叠表单优先选中用户正在阅读的那一个。
 */
export function elementViewportScore(element: HTMLElement): number {
  if (elementIsHiddenByState(element))
    return 0

  const rect = element.getBoundingClientRect()
  if (rect.width <= 0 || rect.height <= 0)
    return 0

  const intersectionLeft = Math.max(0, rect.left)
  const intersectionTop = Math.max(0, rect.top)
  const intersectionRight = Math.min(viewportWidth(), rect.right)
  const intersectionBottom = Math.min(viewportHeight(), rect.bottom)
  const intersectionWidth = intersectionRight - intersectionLeft
  const intersectionHeight = intersectionBottom - intersectionTop
  if (intersectionWidth <= 0 || intersectionHeight <= 0)
    return 0

  const visibleArea = intersectionWidth * intersectionHeight
  const distanceFromViewportTop = Math.abs(Math.max(rect.top, 0))
  return visibleArea * 1000 - distanceFromViewportTop
}

export function elementArea(element: HTMLElement): number {
  const rect = element.getBoundingClientRect()
  return Math.max(0, rect.width) * Math.max(0, rect.height)
}
