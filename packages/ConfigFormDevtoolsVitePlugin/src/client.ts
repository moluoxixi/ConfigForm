import type {
  FormDevtoolsBridge,
  FormDevtoolsNode,
  FormNodeRenderMetric,
  FormNodeSyncMetric,
} from './types'

/** devtools 节点加浏览器 overlay store 独有的状态。 */
interface StoredNode extends FormDevtoolsNode {
  avgRenderMs?: number
  avgSyncMs?: number
  element: HTMLElement | null
  lastRenderMs?: number
  lastRenderPhase?: FormNodeRenderMetric['phase']
  lastSyncMs?: number
  maxRenderMs?: number
  maxSyncMs?: number
  order: number
  registrationOrder: number
  renderSamples: number
  syncSamples: number
}

/** 多表单导航中单个 ConfigForm 实例的聚合状态。 */
interface RootGroup {
  element?: HTMLElement
  formId: string
  formLabel?: string
  hasEnabledElement: boolean
  hasInspectableElement: boolean
  registrationOrder: number
  nodes: StoredNode[]
  viewportScore: number
}

/** 跨渲染保存的可变状态，用来区分用户手动选择和自动选中。 */
interface DevtoolsRenderState {
  activeFormId?: string
  activeFormSelectedByUser?: boolean
}

interface DevtoolsStore {
  nodes: Map<string, StoredNode>
  registerField: FormDevtoolsBridge['registerField']
  updateField: FormDevtoolsBridge['updateField']
  recordRender: FormDevtoolsBridge['recordRender']
  recordSync: FormDevtoolsBridge['recordSync']
  unregisterField: FormDevtoolsBridge['unregisterField']
}

interface BubblePosition {
  left: number
  top: number
  edge: 'left' | 'right'
}

interface OpenSourceCommandPayload {
  args?: unknown
  command?: unknown
}

declare global {
  interface Window {
    __CONFIG_FORM_DEVTOOLS_BRIDGE__?: FormDevtoolsBridge
    __CONFIG_FORM_DEVTOOLS_PENDING__?: boolean
  }
}

const ROOT_ID = 'cf-devtools-root'
const STYLE_ID = 'cf-devtools-style'
const READY_EVENT = 'config-form-devtools:ready'
const BUBBLE_SIZE = 42
const BUBBLE_MARGIN = 16
const BUBBLE_HIDE_OFFSET = 20
const DRAG_THRESHOLD = 4
const RIGHT_DOCK_SCROLLBAR_FALLBACK = 10
const PANEL_MAX_HEIGHT = 560
const CONTEXT_SYNC_ATTRIBUTES = [
  'aria-hidden',
  'aria-selected',
  'class',
  'data-cf-devtools-active',
  'hidden',
  'inert',
  'style',
]

function formatTiming(value: number | undefined): string {
  return typeof value === 'number' ? value.toFixed(2) : '--'
}

function formatOpenSourceCommand(payload: unknown): string | undefined {
  if (!payload || typeof payload !== 'object')
    return undefined

  const command = (payload as { command?: OpenSourceCommandPayload }).command
  if (!command || typeof command !== 'object' || typeof command.command !== 'string')
    return undefined

  const args = Array.isArray(command.args)
    ? command.args.filter((arg): arg is string => typeof arg === 'string')
    : []

  return [command.command, ...args].join(' ')
}

function resolveNodeKindIcon(node: FormDevtoolsNode): 'C' | 'F' {
  return node.kind === 'component' ? 'C' : 'F'
}

function resolveNodeDisplayName(node: FormDevtoolsNode): string {
  if (node.kind === 'component')
    return node.component ?? node.kind

  return node.field ?? node.component ?? node.kind
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function viewportWidth(): number {
  return Math.max(BUBBLE_SIZE, window.innerWidth || document.documentElement.clientWidth || BUBBLE_SIZE)
}

function viewportHeight(): number {
  return Math.max(BUBBLE_SIZE, window.innerHeight || document.documentElement.clientHeight || BUBBLE_SIZE)
}

function rightDockScrollbarWidth(): number {
  const width = window.innerWidth || 0
  const clientWidth = document.documentElement.clientWidth || 0

  if (width > 0 && clientWidth > 0 && width > clientWidth)
    return width - clientWidth

  const clientHeight = document.documentElement.clientHeight || window.innerHeight || 0
  if (document.documentElement.scrollHeight > clientHeight)
    return RIGHT_DOCK_SCROLLBAR_FALLBACK

  return 0
}

function rightDockViewportEdge(): number {
  return viewportWidth() - rightDockScrollbarWidth()
}

function panelViewportHeight(): number {
  return Math.max(BUBBLE_SIZE, viewportHeight() - BUBBLE_MARGIN * 2)
}

function resolvePanelHeight(panel: HTMLElement): number {
  const height = panel.getBoundingClientRect().height
  if (height > 0)
    return Math.min(height, panelViewportHeight())

  return Math.min(PANEL_MAX_HEIGHT, panelViewportHeight())
}

function resolvePanelTop(panel: HTMLElement, position: BubblePosition): number {
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

function assertCompatibleNode(existing: FormDevtoolsNode | undefined, next: FormDevtoolsNode) {
  if (!existing)
    return

  const keys: Array<keyof FormDevtoolsNode> = ['formId', 'kind', 'field', 'component', 'parentId']
  for (const key of keys) {
    if (existing[key] !== undefined && next[key] !== undefined && existing[key] !== next[key]) {
      throw new Error(
        `Conflicting devtools node id: ${next.id} changed ${key} from ${String(existing[key])} to ${String(next[key])}`,
      )
    }
  }

  if (existing.source && next.source && existing.source.id !== next.source.id) {
    throw new Error(
      `Conflicting devtools node id: ${next.id} changed source from ${existing.source.id} to ${next.source.id}`,
    )
  }
}

function compareElementsByDocumentPosition(first: HTMLElement, second: HTMLElement): number {
  if (first === second)
    return 0

  const position = first.compareDocumentPosition(second)
  if (position & Node.DOCUMENT_POSITION_FOLLOWING)
    return -1
  if (position & Node.DOCUMENT_POSITION_PRECEDING)
    return 1
  return 0
}

function selectEarlierElement(current: HTMLElement | undefined, next: HTMLElement | null): HTMLElement | undefined {
  if (!next)
    return current
  if (!current)
    return next
  return compareElementsByDocumentPosition(next, current) < 0 ? next : current
}

function compareRootGroups(first: RootGroup, second: RootGroup): number {
  if (first.element && second.element) {
    const elementOrder = compareElementsByDocumentPosition(first.element, second.element)
    if (elementOrder !== 0)
      return elementOrder
  }

  return first.registrationOrder - second.registrationOrder
}

/**
 * 判断元素或祖先节点是否被显式隐藏，不应参与自动巡检。
 *
 * display:none/v-show 表单仍会留在导航中显示为禁用项，但不会自动成为当前表单。
 */
function elementIsHiddenByState(element: HTMLElement): boolean {
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

function elementHasEnabledBox(element: HTMLElement): boolean {
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
function elementViewportScore(element: HTMLElement): number {
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

function ensureStyle() {
  if (document.getElementById(STYLE_ID))
    return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = `
    .cf-devtools-root { position: fixed; inset: 0; z-index: 2147483647; pointer-events: none; font-family: ui-sans-serif, system-ui, sans-serif; }
    .cf-devtools-bubble { position: fixed; width: 42px; height: 42px; border: 0; border-radius: 50%; background: #111827; color: #fff; box-shadow: 0 8px 24px rgba(0,0,0,.22); cursor: grab; pointer-events: auto; font-size: 16px; transition: transform .16s ease; user-select: none; }
    .cf-devtools-bubble:active { cursor: grabbing; }
    .cf-devtools-bubble.is-left-edge { transform: translateX(-${BUBBLE_HIDE_OFFSET}px); }
    .cf-devtools-bubble.is-right-edge { transform: translateX(${BUBBLE_HIDE_OFFSET}px); }
    .cf-devtools-bubble.is-left-edge:hover, .cf-devtools-bubble.is-right-edge:hover, .cf-devtools-bubble.is-dragging { transform: translateX(0); }
    .cf-devtools-panel { position: fixed; right: 16px; bottom: 68px; box-sizing: border-box; width: min(420px, calc(100vw - 32px)); max-height: min(${PANEL_MAX_HEIGHT}px, calc(100vh - ${BUBBLE_MARGIN * 2}px)); display: none; flex-direction: column; overflow: hidden; border: 1px solid #d1d5db; border-radius: 8px; background: #fff; color: #111827; box-shadow: 0 16px 48px rgba(0,0,0,.22); pointer-events: auto; }
    .cf-devtools-panel.is-open { display: flex; }
    .cf-devtools-header { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border-bottom: 1px solid #e5e7eb; cursor: move; font-weight: 600; user-select: none; }
    .cf-devtools-body { overflow: auto; padding: 8px; }
    .cf-devtools-empty { padding: 16px; color: #6b7280; font-size: 13px; }
    .cf-devtools-node { display: grid; grid-template-columns: 1fr auto auto; gap: 8px; align-items: center; min-height: 30px; border: 0; border-radius: 6px; background: transparent; padding: 5px 6px; color: inherit; text-align: left; font: inherit; }
    .cf-devtools-node:hover { background: #f3f4f6; }
    .cf-devtools-node-main { display: grid; grid-template-columns: 14px minmax(0, 1fr); gap: 6px; align-items: start; min-width: 0; }
    .cf-devtools-node-kind { color: #4b5563; font-size: 11px; font-weight: 700; line-height: 16px; text-align: center; }
    .cf-devtools-node-kind.is-component { color: #7c3aed; }
    .cf-devtools-node-kind.is-field { color: #047857; }
    .cf-devtools-node-text { min-width: 0; }
    .cf-devtools-node-key { font-size: 12px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .cf-devtools-node-meta { color: #6b7280; font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .cf-devtools-layout { display: grid; grid-template-columns: 132px minmax(0, 1fr); gap: 8px; min-height: 0; }
    .cf-devtools-nav { display: flex; flex-direction: column; gap: 4px; border-right: 1px solid #e5e7eb; padding-right: 8px; }
    .cf-devtools-nav-item { width: 100%; min-height: 42px; border: 1px solid transparent; border-radius: 6px; background: transparent; padding: 6px; color: inherit; cursor: pointer; text-align: left; font: inherit; }
    .cf-devtools-nav-item:hover { background: #f3f4f6; }
    .cf-devtools-nav-item.is-active { border-color: #c7d2fe; background: #eef2ff; color: #1e3a8a; }
    .cf-devtools-nav-item:disabled { opacity: .42; cursor: not-allowed; }
    .cf-devtools-nav-item.is-disabled:hover { background: transparent; }
    .cf-devtools-nav-title { display: block; overflow: hidden; font-size: 12px; font-weight: 700; text-overflow: ellipsis; white-space: nowrap; }
    .cf-devtools-nav-meta { display: block; overflow: hidden; margin-top: 2px; color: #6b7280; font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }
    .cf-devtools-tree { min-width: 0; }
    .cf-devtools-timings { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; font-variant-numeric: tabular-nums; font-size: 11px; line-height: 1.15; }
    .cf-devtools-timing { white-space: nowrap; }
    .cf-devtools-timing.is-render { color: #047857; }
    .cf-devtools-timing.is-sync { color: #2563eb; }
    .cf-devtools-open { width: 24px; height: 24px; border: 1px solid #d1d5db; border-radius: 6px; background: #fff; cursor: pointer; }
    .cf-devtools-open:disabled { opacity: .35; cursor: not-allowed; }
    .cf-devtools-highlight { position: fixed; display: none; box-sizing: border-box; border: 2px solid #38bdf8; background: rgba(56,189,248,.12); box-shadow: 0 0 0 9999px rgba(15,23,42,.08); pointer-events: none; border-radius: 4px; }
    .cf-devtools-error { padding: 0 12px 10px; color: #b91c1c; font-size: 12px; }
  `
  document.head.append(style)
}

function createStore(render: () => void): DevtoolsStore {
  const nodes = new Map<string, StoredNode>()
  const formRegistrationOrders = new Map<string, number>()
  const pendingRenderMetrics = new Map<string, FormNodeRenderMetric[]>()
  const pendingSyncMetrics = new Map<string, FormNodeSyncMetric[]>()
  let orderSeed = 0
  let formRegistrationOrderSeed = 0

  function resolveFormRegistrationOrder(formId: string): number {
    const existing = formRegistrationOrders.get(formId)
    if (existing !== undefined)
      return existing

    const next = ++formRegistrationOrderSeed
    formRegistrationOrders.set(formId, next)
    return next
  }

  function dropUnusedFormRegistrationOrder(formId: string) {
    for (const node of nodes.values()) {
      if (node.formId === formId)
        return
    }
    formRegistrationOrders.delete(formId)
  }

  function applyRenderMetric(node: StoredNode, metric: FormNodeRenderMetric) {
    const total = (node.avgRenderMs ?? 0) * node.renderSamples + metric.duration
    node.renderSamples += 1
    node.lastRenderMs = metric.duration
    node.lastRenderPhase = metric.phase
    node.maxRenderMs = Math.max(node.maxRenderMs ?? metric.duration, metric.duration)
    node.avgRenderMs = total / node.renderSamples
  }

  function applySyncMetric(node: StoredNode, metric: FormNodeSyncMetric) {
    const total = (node.avgSyncMs ?? 0) * node.syncSamples + metric.duration
    node.syncSamples += 1
    node.lastSyncMs = metric.duration
    node.maxSyncMs = Math.max(node.maxSyncMs ?? metric.duration, metric.duration)
    node.avgSyncMs = total / node.syncSamples
  }

  function pushPendingMetric<TMetric>(pending: Map<string, TMetric[]>, metric: TMetric & { id: string }) {
    const existing = pending.get(metric.id)
    if (existing) {
      existing.push(metric)
      return
    }

    pending.set(metric.id, [metric])
  }

  function flushPendingMetrics(node: StoredNode) {
    // render/sync 指标可能早于节点注册到达，注册时必须补记，避免刷新时丢样本。
    const renderMetrics = pendingRenderMetrics.get(node.id)
    if (renderMetrics) {
      for (const metric of renderMetrics)
        applyRenderMetric(node, metric)
      pendingRenderMetrics.delete(node.id)
    }

    const syncMetrics = pendingSyncMetrics.get(node.id)
    if (syncMetrics) {
      for (const metric of syncMetrics)
        applySyncMetric(node, metric)
      pendingSyncMetrics.delete(node.id)
    }
  }

  function upsertNode(node: FormDevtoolsNode, element: HTMLElement | null) {
    const existing = nodes.get(node.id)
    assertCompatibleNode(existing, node)
    const stored: StoredNode = {
      ...existing,
      ...node,
      element,
      order: node.order ?? existing?.order ?? ++orderSeed,
      registrationOrder: existing?.registrationOrder ?? resolveFormRegistrationOrder(node.formId),
      renderSamples: existing?.renderSamples ?? 0,
      syncSamples: existing?.syncSamples ?? 0,
    }
    nodes.set(node.id, stored)
    flushPendingMetrics(stored)
    render()
  }

  return {
    nodes,
    recordRender(metric: FormNodeRenderMetric) {
      const node = nodes.get(metric.id)
      if (!node) {
        pushPendingMetric(pendingRenderMetrics, metric)
        return
      }

      applyRenderMetric(node, metric)
      render()
    },
    recordSync(metric: FormNodeSyncMetric) {
      const node = nodes.get(metric.id)
      if (!node) {
        pushPendingMetric(pendingSyncMetrics, metric)
        return
      }

      applySyncMetric(node, metric)
      render()
    },
    registerField(node: FormDevtoolsNode, element: HTMLElement | null) {
      upsertNode(node, element)
    },
    unregisterField(id: string) {
      const existing = nodes.get(id)
      nodes.delete(id)
      pendingRenderMetrics.delete(id)
      pendingSyncMetrics.delete(id)
      if (existing)
        dropUnusedFormRegistrationOrder(existing.formId)
      render()
    },
    updateField(node: FormDevtoolsNode, element: HTMLElement | null) {
      upsertNode(node, element)
    },
  }
}

/** 按 ConfigForm 实例聚合扁平节点，并计算导航所需元数据。 */
function collectRootGroups(store: DevtoolsStore): RootGroup[] {
  const groups = new Map<string, RootGroup>()

  for (const node of store.nodes.values()) {
    const group = groups.get(node.formId)
    if (group) {
      group.formLabel ??= node.formLabel
      group.element = selectEarlierElement(group.element, node.element)
      group.hasInspectableElement = group.hasInspectableElement || Boolean(node.element)
      group.hasEnabledElement = group.hasEnabledElement || nodeHasEnabledElement(node)
      group.viewportScore = Math.max(group.viewportScore, nodeViewportScore(node))
      if (!node.parentId)
        group.nodes.push(node)
      continue
    }

    groups.set(node.formId, {
      element: node.element ?? undefined,
      formId: node.formId,
      formLabel: node.formLabel,
      hasEnabledElement: nodeHasEnabledElement(node),
      hasInspectableElement: Boolean(node.element),
      nodes: node.parentId ? [] : [node],
      registrationOrder: node.registrationOrder,
      viewportScore: nodeViewportScore(node),
    })
  }

  return [...groups.values()]
    .sort(compareRootGroups)
    .map(group => ({
      ...group,
      nodes: group.nodes.sort((a, b) => a.order - b.order),
    }))
}

function nodeHasEnabledElement(node: StoredNode): boolean {
  if (!node.element)
    return false

  return elementHasEnabledBox(node.element)
}

function nodeViewportScore(node: StoredNode): number {
  if (!node.element)
    return 0

  return elementViewportScore(node.element)
}

function groupIsDisabled(group: RootGroup): boolean {
  return group.hasInspectableElement && !group.hasEnabledElement
}

/** 选出当前视口中可见强度最高的可用表单。 */
function resolveViewportActiveGroup(groups: RootGroup[]): RootGroup | undefined {
  return groups.reduce<RootGroup | undefined>((best, group) => {
    if (groupIsDisabled(group) || group.viewportScore <= 0)
      return best
    if (!best || group.viewportScore > best.viewportScore)
      return group
    return best
  }, undefined)
}

/**
 * 解析当前应渲染的表单。
 *
 * 用户手动选择会保持到外部上下文变化；没有手动选择时由视口可见强度决定。
 */
function resolveActiveGroup(groups: RootGroup[], state: DevtoolsRenderState): RootGroup | undefined {
  const enabledGroups = groups.filter(group => !groupIsDisabled(group))

  if (enabledGroups.length === 0) {
    state.activeFormId = undefined
    state.activeFormSelectedByUser = false
    return undefined
  }

  const activeGroup = enabledGroups.find(group => group.formId === state.activeFormId)
  if (state.activeFormSelectedByUser && activeGroup)
    return activeGroup

  const viewportActiveGroup = resolveViewportActiveGroup(enabledGroups)
  state.activeFormSelectedByUser = false
  return viewportActiveGroup ?? activeGroup ?? enabledGroups[0]
}

function resolveGroupMeta(group: RootGroup): string {
  return group.nodes
    .slice(0, 2)
    .map(resolveNodeDisplayName)
    .join(', ') || group.formId
}

function createFormNavItem(
  group: RootGroup,
  index: number,
  active: boolean,
  disabled: boolean,
  onSelect: () => void,
): HTMLElement {
  const button = document.createElement('button')
  button.className = `cf-devtools-nav-item${active ? ' is-active' : ''}${disabled ? ' is-disabled' : ''}`
  button.dataset.cfDevtoolsNavFormId = group.formId
  button.disabled = disabled
  if (disabled)
    button.title = 'ConfigForm is hidden'
  button.type = 'button'

  const title = document.createElement('span')
  title.className = 'cf-devtools-nav-title'
  title.textContent = group.formLabel ?? `ConfigForm ${index + 1}`

  const meta = document.createElement('span')
  meta.className = 'cf-devtools-nav-meta'
  meta.textContent = disabled ? `${resolveGroupMeta(group)} · hidden` : resolveGroupMeta(group)

  button.addEventListener('click', onSelect)
  button.append(title, meta)
  return button
}

function createTimingRow(
  label: 'render' | 'sync',
  value: number | undefined,
  avg: number | undefined,
  max: number | undefined,
  samples: number,
): HTMLElement {
  const item = document.createElement('span')
  item.className = `cf-devtools-timing is-${label}`
  item.textContent = `${label} ${formatTiming(value)} ms`
  item.title = samples > 0
    ? `${label}: avg ${formatTiming(avg)} ms, max ${formatTiming(max)} ms, samples ${samples}`
    : `${label}: no samples`
  return item
}

function createNodeRow(
  node: StoredNode,
  store: DevtoolsStore,
  level: number,
  highlight: (element: HTMLElement | null) => void,
  setError: (message: string) => void,
): HTMLElement {
  const row = document.createElement('div')
  row.className = 'cf-devtools-node'
  row.dataset.cfDevtoolsNodeId = node.id
  row.style.paddingLeft = `${6 + level * 14}px`

  const main = document.createElement('div')
  main.className = 'cf-devtools-node-main'

  const kind = document.createElement('span')
  kind.className = `cf-devtools-node-kind is-${node.kind}`
  kind.textContent = resolveNodeKindIcon(node)

  const text = document.createElement('div')
  text.className = 'cf-devtools-node-text'

  const key = document.createElement('div')
  key.className = 'cf-devtools-node-key'
  key.textContent = resolveNodeDisplayName(node)

  const meta = document.createElement('div')
  meta.className = 'cf-devtools-node-meta'
  meta.textContent = [node.label, node.slotName ? `slot:${node.slotName}` : undefined].filter(Boolean).join(' · ')

  const timings = document.createElement('div')
  timings.className = 'cf-devtools-timings'
  timings.append(
    createTimingRow('render', node.lastRenderMs, node.avgRenderMs, node.maxRenderMs, node.renderSamples),
    createTimingRow('sync', node.lastSyncMs, node.avgSyncMs, node.maxSyncMs, node.syncSamples),
  )

  const open = document.createElement('button')
  open.className = 'cf-devtools-open'
  open.dataset.cfDevtoolsOpen = node.id
  open.type = 'button'
  open.textContent = '↗'
  open.title = 'Open source'
  open.disabled = true
  if (node.source) {
    const source = node.source
    open.disabled = false
    open.addEventListener('click', async (event) => {
      event.stopPropagation()

      const response = await fetch('/__config-form-devtools/open', {
        body: JSON.stringify({
          column: source.column,
          file: source.file,
          line: source.line,
        }),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      })
      const text = await response.text()

      if (!response.ok) {
        try {
          const payload = JSON.parse(text) as { error?: unknown }
          setError(typeof payload.error === 'string' ? payload.error : text)
        }
        catch {
          setError(text)
        }
        return
      }

      try {
        const command = formatOpenSourceCommand(JSON.parse(text))
        setError(command ? `Opened source: ${command}` : '')
      }
      catch {
        setError('')
      }
    })
  }

  row.addEventListener('mouseenter', () => highlight(node.element))
  row.addEventListener('mouseleave', () => highlight(null))

  text.append(key, meta)
  main.append(kind, text)
  row.append(main, timings, open)

  const children = [...store.nodes.values()]
    .filter(item => item.parentId === node.id)
    .sort((a, b) => a.order - b.order)

  const wrapper = document.createElement('div')
  wrapper.append(row)
  for (const child of children)
    wrapper.append(createNodeRow(child, store, level + 1, highlight, setError))

  return wrapper
}

function renderTree(
  container: HTMLElement,
  store: DevtoolsStore,
  highlight: (element: HTMLElement | null) => void,
  setError: (message: string) => void,
  state: DevtoolsRenderState,
) {
  container.textContent = ''

  const groups = collectRootGroups(store)
  const roots = groups.flatMap(group => group.nodes)

  if (roots.length === 0) {
    state.activeFormId = undefined
    state.activeFormSelectedByUser = false
    const empty = document.createElement('div')
    empty.className = 'cf-devtools-empty'
    empty.textContent = 'No fields'
    container.append(empty)
    return
  }

  if (groups.length === 1 && !groupIsDisabled(groups[0])) {
    state.activeFormId = groups[0]?.formId
    state.activeFormSelectedByUser = false
    for (const node of roots)
      container.append(createNodeRow(node, store, 0, highlight, setError))
    return
  }

  const activeGroup = resolveActiveGroup(groups, state)
  state.activeFormId = activeGroup?.formId

  const layout = document.createElement('div')
  layout.className = 'cf-devtools-layout'

  const nav = document.createElement('div')
  nav.className = 'cf-devtools-nav'

  const tree = document.createElement('div')
  tree.className = 'cf-devtools-tree'

  groups.forEach((group, index) => {
    const disabled = groupIsDisabled(group)
    nav.append(createFormNavItem(
      group,
      index,
      group.formId === activeGroup?.formId,
      disabled,
      () => {
        if (disabled)
          return
        state.activeFormId = group.formId
        state.activeFormSelectedByUser = true
        renderTree(container, store, highlight, setError, state)
      },
    ))
  })

  if (activeGroup) {
    for (const node of activeGroup.nodes)
      tree.append(createNodeRow(node, store, 0, highlight, setError))
  }
  else {
    const empty = document.createElement('div')
    empty.className = 'cf-devtools-empty'
    empty.textContent = 'No visible ConfigForm'
    tree.append(empty)
  }

  layout.append(nav, tree)
  container.append(layout)
}

function updateBubblePosition(bubble: HTMLElement, panel: HTMLElement, position: BubblePosition) {
  bubble.style.left = `${position.left}px`
  bubble.style.top = `${position.top}px`
  bubble.classList.toggle('is-left-edge', position.edge === 'left')
  bubble.classList.toggle('is-right-edge', position.edge === 'right')

  panel.style.bottom = 'auto'
  panel.style.top = `${resolvePanelTop(panel, position)}px`

  if (position.edge === 'left') {
    panel.style.left = `${BUBBLE_MARGIN}px`
    panel.style.right = 'auto'
    return
  }

  panel.style.left = 'auto'
  panel.style.right = `${BUBBLE_MARGIN + rightDockScrollbarWidth()}px`
}

function installBubbleDrag(bubble: HTMLElement, panel: HTMLElement) {
  const maxLeft = () => Math.max(0, rightDockViewportEdge() - BUBBLE_SIZE)
  const maxTop = () => viewportHeight() - BUBBLE_SIZE
  const position: BubblePosition = {
    edge: 'right',
    left: clamp(rightDockViewportEdge() - BUBBLE_SIZE - BUBBLE_MARGIN, 0, maxLeft()),
    top: clamp(viewportHeight() - BUBBLE_SIZE - BUBBLE_MARGIN, 0, maxTop()),
  }
  let dragStartX = 0
  let dragStartY = 0
  let startLeft = 0
  let startTop = 0
  let dragging = false
  let moved = false
  let suppressNextClick = false

  function snapToEdge() {
    position.edge = position.left + BUBBLE_SIZE / 2 < viewportWidth() / 2 ? 'left' : 'right'
    position.left = position.edge === 'left' ? 0 : maxLeft()
    position.top = clamp(position.top, 0, maxTop())
    updateBubblePosition(bubble, panel, position)
  }

  bubble.addEventListener('mousedown', (event) => {
    if (event.button !== 0)
      return

    dragging = true
    moved = false
    dragStartX = event.clientX
    dragStartY = event.clientY
    startLeft = position.left
    startTop = position.top
    bubble.classList.add('is-dragging')
    event.preventDefault()
  })

  document.addEventListener('mousemove', (event) => {
    if (!dragging)
      return

    const dx = event.clientX - dragStartX
    const dy = event.clientY - dragStartY
    moved = moved || Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD
    position.left = clamp(startLeft + dx, 0, maxLeft())
    position.top = clamp(startTop + dy, 0, maxTop())
    updateBubblePosition(bubble, panel, position)
  })

  document.addEventListener('mouseup', () => {
    if (!dragging)
      return

    dragging = false
    bubble.classList.remove('is-dragging')

    if (moved) {
      suppressNextClick = true
      snapToEdge()
    }
  })

  bubble.addEventListener('click', (event) => {
    if (!suppressNextClick)
      return

    suppressNextClick = false
    event.stopImmediatePropagation()
    event.preventDefault()
  }, { capture: true })

  window.addEventListener('resize', () => {
    position.top = clamp(position.top, 0, maxTop())
    position.left = position.edge === 'left' ? 0 : maxLeft()
    updateBubblePosition(bubble, panel, position)
  })

  updateBubblePosition(bubble, panel, position)
}

function installPanelDrag(panel: HTMLElement, handle: HTMLElement) {
  let dragStartX = 0
  let dragStartY = 0
  let panelStartLeft = 0
  let panelStartTop = 0
  let panelWidth = 0
  let panelHeight = 0
  let dragging = false

  function maxLeft() {
    return Math.max(BUBBLE_MARGIN, rightDockViewportEdge() - BUBBLE_MARGIN - panelWidth)
  }

  function maxTop() {
    return Math.max(BUBBLE_MARGIN, viewportHeight() - BUBBLE_MARGIN - panelHeight)
  }

  function movePanel(left: number, top: number) {
    panel.style.bottom = 'auto'
    panel.style.left = `${clamp(left, BUBBLE_MARGIN, maxLeft())}px`
    panel.style.right = 'auto'
    panel.style.top = `${clamp(top, BUBBLE_MARGIN, maxTop())}px`
  }

  handle.addEventListener('mousedown', (event) => {
    if (event.button !== 0)
      return

    const rect = panel.getBoundingClientRect()
    dragging = true
    dragStartX = event.clientX
    dragStartY = event.clientY
    panelStartLeft = rect.left
    panelStartTop = rect.top
    panelWidth = rect.width
    panelHeight = rect.height
    event.preventDefault()
  })

  document.addEventListener('mousemove', (event) => {
    if (!dragging)
      return

    movePanel(
      panelStartLeft + event.clientX - dragStartX,
      panelStartTop + event.clientY - dragStartY,
    )
  })

  document.addEventListener('mouseup', () => {
    dragging = false
  })
}

function installOutsidePanelClose(bubble: HTMLElement, panel: HTMLElement, closePanel: () => void) {
  document.addEventListener('click', (event) => {
    if (!panel.classList.contains('is-open'))
      return

    const target = event.target
    if (!(target instanceof Node))
      return

    if (panel.contains(target) || bubble.contains(target))
      return

    closePanel()
  }, { capture: true })
}

function createAsyncRenderScheduler(render: () => void): () => void {
  let pending = false

  return () => {
    if (pending)
      return

    pending = true
    const flush = () => {
      pending = false
      render()
    }

    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(flush)
      return
    }

    setTimeout(flush, 0)
  }
}

function installExternalContextSync(root: HTMLElement, render: () => void, resetManualSelection: () => void) {
  const scheduleRender = createAsyncRenderScheduler(render)
  const scheduleAutoRender = () => {
    resetManualSelection()
    scheduleRender()
  }

  document.addEventListener('click', (event) => {
    const target = event.target
    if (target instanceof Node && root.contains(target))
      return

    scheduleAutoRender()
  }, { capture: true })

  document.addEventListener('keyup', (event) => {
    const target = event.target
    if (target instanceof Node && root.contains(target))
      return

    scheduleAutoRender()
  }, { capture: true })

  window.addEventListener('scroll', scheduleAutoRender, { capture: true, passive: true })
  window.addEventListener('resize', scheduleAutoRender, { passive: true })

  if (typeof MutationObserver === 'undefined')
    return

  const observer = new MutationObserver((mutations) => {
    const hasExternalContextChange = mutations.some((mutation) => {
      const target = mutation.target
      return target instanceof Node && !root.contains(target)
    })
    if (hasExternalContextChange)
      scheduleAutoRender()
  })

  observer.observe(document.body, {
    attributeFilter: CONTEXT_SYNC_ATTRIBUTES,
    attributes: true,
    subtree: true,
  })
}

/** 安装浏览器 overlay，并返回全局 ConfigForm devtools bridge。 */
export function installConfigFormDevtools(): FormDevtoolsBridge {
  if (typeof document === 'undefined')
    throw new Error('ConfigForm devtools client requires a browser document')

  const existing = window.__CONFIG_FORM_DEVTOOLS_BRIDGE__
  if (existing)
    return existing

  ensureStyle()

  const root = document.createElement('div')
  root.id = ROOT_ID
  root.className = 'cf-devtools-root'

  const bubble = document.createElement('button')
  bubble.className = 'cf-devtools-bubble'
  bubble.dataset.cfDevtools = 'bubble'
  bubble.type = 'button'
  bubble.textContent = 'CF'

  const panel = document.createElement('div')
  panel.className = 'cf-devtools-panel'
  panel.dataset.cfDevtools = 'panel'

  const header = document.createElement('div')
  header.className = 'cf-devtools-header'
  header.textContent = 'ConfigForm'

  const body = document.createElement('div')
  body.className = 'cf-devtools-body'

  const errorBox = document.createElement('div')
  errorBox.className = 'cf-devtools-error'

  const highlightBox = document.createElement('div')
  highlightBox.className = 'cf-devtools-highlight'
  highlightBox.dataset.cfDevtools = 'highlight'

  function highlight(element: HTMLElement | null) {
    if (!element) {
      highlightBox.style.display = 'none'
      return
    }

    const rect = element.getBoundingClientRect()
    highlightBox.style.display = 'block'
    highlightBox.style.left = `${rect.left}px`
    highlightBox.style.top = `${rect.top}px`
    highlightBox.style.width = `${rect.width}px`
    highlightBox.style.height = `${rect.height}px`
  }

  function setError(message: string) {
    errorBox.textContent = message
  }

  function closePanel() {
    panel.classList.remove('is-open')
    highlight(null)
    setError('')
  }

  const renderState: DevtoolsRenderState = {}
  const store = createStore(() => renderTree(body, store, highlight, setError, renderState))
  const bridge: FormDevtoolsBridge = {
    recordRender: store.recordRender,
    recordSync: store.recordSync,
    registerField: store.registerField,
    unregisterField: store.unregisterField,
    updateField: store.updateField,
  }

  bubble.addEventListener('click', () => {
    panel.classList.toggle('is-open')
    renderTree(body, store, highlight, setError, renderState)
  })

  panel.append(header, body, errorBox)
  root.append(bubble, panel, highlightBox)
  document.body.append(root)
  installBubbleDrag(bubble, panel)
  installPanelDrag(panel, header)
  installOutsidePanelClose(bubble, panel, closePanel)
  installExternalContextSync(
    root,
    () => renderTree(body, store, highlight, setError, renderState),
    () => {
      renderState.activeFormSelectedByUser = false
    },
  )
  window.__CONFIG_FORM_DEVTOOLS_PENDING__ = true
  window.__CONFIG_FORM_DEVTOOLS_BRIDGE__ = bridge
  window.dispatchEvent(new CustomEvent(READY_EVENT, { detail: bridge }))
  renderTree(body, store, highlight, setError, renderState)

  return bridge
}
