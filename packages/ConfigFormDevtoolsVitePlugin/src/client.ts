import type {
  FormDevtoolsBridge,
  FormDevtoolsNode,
  FormFieldPatchMetric,
} from './types'

interface StoredNode extends FormDevtoolsNode {
  element: HTMLElement | null
  formOrder: number
  lastPatchMs?: number
  maxPatchMs?: number
  avgPatchMs?: number
  order: number
  samples: number
}

interface RootGroup {
  formId: string
  formOrder: number
  nodes: StoredNode[]
}

interface DevtoolsStore {
  nodes: Map<string, StoredNode>
  registerField: FormDevtoolsBridge['registerField']
  updateField: FormDevtoolsBridge['updateField']
  recordPatch: FormDevtoolsBridge['recordPatch']
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

function formatPatch(value: number | undefined): string {
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
    .cf-devtools-form-group { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: 4px; border-top: 1px solid #f3f4f6; padding: 7px 6px 5px; color: #374151; font-size: 11px; font-weight: 700; }
    .cf-devtools-form-group:first-child { margin-top: 0; border-top: 0; }
    .cf-devtools-form-label { flex: none; }
    .cf-devtools-form-id { min-width: 0; overflow: hidden; color: #6b7280; font-weight: 500; text-overflow: ellipsis; white-space: nowrap; }
    .cf-devtools-patch { font-variant-numeric: tabular-nums; font-size: 11px; color: #047857; }
    .cf-devtools-open { width: 24px; height: 24px; border: 1px solid #d1d5db; border-radius: 6px; background: #fff; cursor: pointer; }
    .cf-devtools-open:disabled { opacity: .35; cursor: not-allowed; }
    .cf-devtools-highlight { position: fixed; display: none; border: 2px solid #38bdf8; background: rgba(56,189,248,.12); box-shadow: 0 0 0 9999px rgba(15,23,42,.08); pointer-events: none; border-radius: 4px; }
    .cf-devtools-error { padding: 0 12px 10px; color: #b91c1c; font-size: 12px; }
  `
  document.head.append(style)
}

function createStore(render: () => void): DevtoolsStore {
  const nodes = new Map<string, StoredNode>()
  const formOrders = new Map<string, number>()
  let orderSeed = 0
  let formOrderSeed = 0

  function resolveFormOrder(formId: string): number {
    const existing = formOrders.get(formId)
    if (existing !== undefined)
      return existing

    const next = ++formOrderSeed
    formOrders.set(formId, next)
    return next
  }

  function dropUnusedFormOrder(formId: string) {
    for (const node of nodes.values()) {
      if (node.formId === formId)
        return
    }
    formOrders.delete(formId)
  }

  function upsertNode(node: FormDevtoolsNode, element: HTMLElement | null) {
    const existing = nodes.get(node.id)
    assertCompatibleNode(existing, node)
    nodes.set(node.id, {
      ...existing,
      ...node,
      element,
      formOrder: existing?.formOrder ?? resolveFormOrder(node.formId),
      order: node.order ?? existing?.order ?? ++orderSeed,
      samples: existing?.samples ?? 0,
    })
    render()
  }

  return {
    nodes,
    recordPatch(metric: FormFieldPatchMetric) {
      const node = nodes.get(metric.id)
      if (!node)
        return

      const total = (node.avgPatchMs ?? 0) * node.samples + metric.duration
      node.samples += 1
      node.lastPatchMs = metric.duration
      node.maxPatchMs = Math.max(node.maxPatchMs ?? metric.duration, metric.duration)
      node.avgPatchMs = total / node.samples
      render()
    },
    registerField(node: FormDevtoolsNode, element: HTMLElement | null) {
      upsertNode(node, element)
    },
    unregisterField(id: string) {
      const existing = nodes.get(id)
      nodes.delete(id)
      if (existing)
        dropUnusedFormOrder(existing.formId)
      render()
    },
    updateField(node: FormDevtoolsNode, element: HTMLElement | null) {
      upsertNode(node, element)
    },
  }
}

function collectRootGroups(store: DevtoolsStore): RootGroup[] {
  const groups = new Map<string, RootGroup>()

  for (const node of store.nodes.values()) {
    if (node.parentId)
      continue

    const group = groups.get(node.formId)
    if (group) {
      group.nodes.push(node)
      continue
    }

    groups.set(node.formId, {
      formId: node.formId,
      formOrder: node.formOrder,
      nodes: [node],
    })
  }

  return [...groups.values()]
    .sort((a, b) => a.formOrder - b.formOrder)
    .map(group => ({
      ...group,
      nodes: group.nodes.sort((a, b) => a.order - b.order),
    }))
}

function createFormGroupHeader(group: RootGroup, index: number): HTMLElement {
  const row = document.createElement('div')
  row.className = 'cf-devtools-form-group'
  row.dataset.cfDevtoolsFormId = group.formId

  const label = document.createElement('span')
  label.className = 'cf-devtools-form-label'
  label.textContent = `ConfigForm ${index + 1}`

  const id = document.createElement('span')
  id.className = 'cf-devtools-form-id'
  id.textContent = group.formId

  row.append(label, id)
  return row
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

  const patch = document.createElement('span')
  patch.className = 'cf-devtools-patch'
  patch.textContent = `${formatPatch(node.lastPatchMs)} ms`

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
  row.append(main, patch, open)

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
) {
  container.textContent = ''

  const groups = collectRootGroups(store)
  const roots = groups.flatMap(group => group.nodes)

  if (roots.length === 0) {
    const empty = document.createElement('div')
    empty.className = 'cf-devtools-empty'
    empty.textContent = 'No fields'
    container.append(empty)
    return
  }

  if (groups.length === 1) {
    for (const node of roots)
      container.append(createNodeRow(node, store, 0, highlight, setError))
    return
  }

  groups.forEach((group, index) => {
    container.append(createFormGroupHeader(group, index))
    for (const node of group.nodes)
      container.append(createNodeRow(node, store, 1, highlight, setError))
  })
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

  const store = createStore(() => renderTree(body, store, highlight, setError))
  const bridge: FormDevtoolsBridge = {
    recordPatch: store.recordPatch,
    registerField: store.registerField,
    unregisterField: store.unregisterField,
    updateField: store.updateField,
  }

  bubble.addEventListener('click', () => {
    panel.classList.toggle('is-open')
    renderTree(body, store, highlight, setError)
  })

  panel.append(header, body, errorBox)
  root.append(bubble, panel, highlightBox)
  document.body.append(root)
  installBubbleDrag(bubble, panel)
  installPanelDrag(panel, header)
  installOutsidePanelClose(bubble, panel, closePanel)
  window.__CONFIG_FORM_DEVTOOLS_PENDING__ = true
  window.__CONFIG_FORM_DEVTOOLS_BRIDGE__ = bridge
  window.dispatchEvent(new CustomEvent(READY_EVENT, { detail: bridge }))
  renderTree(body, store, highlight, setError)

  return bridge
}
