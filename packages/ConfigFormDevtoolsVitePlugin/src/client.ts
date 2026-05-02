import type {
  FormDevtoolsBridge,
  FormDevtoolsNode,
  FormFieldPatchMetric,
} from './types'

interface StoredNode extends FormDevtoolsNode {
  element: HTMLElement | null
  lastPatchMs?: number
  maxPatchMs?: number
  avgPatchMs?: number
  order: number
  samples: number
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

function formatPatch(value: number | undefined): string {
  return typeof value === 'number' ? value.toFixed(2) : '--'
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
    .cf-devtools-panel { position: fixed; right: 16px; bottom: 68px; width: min(420px, calc(100vw - 32px)); max-height: min(560px, calc(100vh - 96px)); display: none; flex-direction: column; overflow: hidden; border: 1px solid #d1d5db; border-radius: 8px; background: #fff; color: #111827; box-shadow: 0 16px 48px rgba(0,0,0,.22); pointer-events: auto; }
    .cf-devtools-panel.is-open { display: flex; }
    .cf-devtools-header { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border-bottom: 1px solid #e5e7eb; font-weight: 600; }
    .cf-devtools-body { overflow: auto; padding: 8px; }
    .cf-devtools-empty { padding: 16px; color: #6b7280; font-size: 13px; }
    .cf-devtools-node { display: grid; grid-template-columns: 1fr auto auto; gap: 8px; align-items: center; min-height: 30px; border: 0; border-radius: 6px; background: transparent; padding: 5px 6px; color: inherit; text-align: left; font: inherit; }
    .cf-devtools-node:hover { background: #f3f4f6; }
    .cf-devtools-node-main { min-width: 0; }
    .cf-devtools-node-key { font-size: 12px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .cf-devtools-node-meta { color: #6b7280; font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
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
  let orderSeed = 0

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
      const existing = nodes.get(node.id)
      nodes.set(node.id, {
        ...existing,
        ...node,
        element,
        order: existing?.order ?? ++orderSeed,
        samples: existing?.samples ?? 0,
      })
      render()
    },
    unregisterField(id: string) {
      nodes.delete(id)
      render()
    },
    updateField(node: FormDevtoolsNode, element: HTMLElement | null) {
      const existing = nodes.get(node.id)
      nodes.set(node.id, {
        ...existing,
        ...node,
        element,
        order: existing?.order ?? ++orderSeed,
        samples: existing?.samples ?? 0,
      })
      render()
    },
  }
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

  const key = document.createElement('div')
  key.className = 'cf-devtools-node-key'
  key.textContent = node.field ?? node.component ?? node.kind

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

      if (!response.ok) {
        const text = await response.text()
        try {
          const payload = JSON.parse(text) as { error?: unknown }
          setError(typeof payload.error === 'string' ? payload.error : text)
        }
        catch {
          setError(text)
        }
        return
      }

      setError('')
    })
  }

  row.addEventListener('mouseenter', () => highlight(node.element))
  row.addEventListener('mouseleave', () => highlight(null))

  main.append(key, meta)
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

  const roots = [...store.nodes.values()]
    .filter(node => !node.parentId)
    .sort((a, b) => a.order - b.order)

  if (roots.length === 0) {
    const empty = document.createElement('div')
    empty.className = 'cf-devtools-empty'
    empty.textContent = 'No fields'
    container.append(empty)
    return
  }

  for (const node of roots)
    container.append(createNodeRow(node, store, 0, highlight, setError))
}

function updateBubblePosition(bubble: HTMLElement, panel: HTMLElement, position: BubblePosition) {
  bubble.style.left = `${position.left}px`
  bubble.style.top = `${position.top}px`
  bubble.classList.toggle('is-left-edge', position.edge === 'left')
  bubble.classList.toggle('is-right-edge', position.edge === 'right')

  panel.style.bottom = 'auto'
  panel.style.top = `${clamp(position.top - 300, BUBBLE_MARGIN, Math.max(BUBBLE_MARGIN, viewportHeight() - 96))}px`

  if (position.edge === 'left') {
    panel.style.left = `${BUBBLE_MARGIN}px`
    panel.style.right = 'auto'
    return
  }

  panel.style.left = 'auto'
  panel.style.right = `${BUBBLE_MARGIN}px`
}

function installBubbleDrag(bubble: HTMLElement, panel: HTMLElement) {
  const maxLeft = () => viewportWidth() - BUBBLE_SIZE
  const maxTop = () => viewportHeight() - BUBBLE_SIZE
  const position: BubblePosition = {
    edge: 'right',
    left: clamp(viewportWidth() - BUBBLE_SIZE - BUBBLE_MARGIN, 0, maxLeft()),
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
  window.__CONFIG_FORM_DEVTOOLS_PENDING__ = true
  window.__CONFIG_FORM_DEVTOOLS_BRIDGE__ = bridge
  window.dispatchEvent(new CustomEvent(READY_EVENT, { detail: bridge }))
  renderTree(body, store, highlight, setError)

  return bridge
}
