import type {
  BubblePosition,
  DevtoolsRenderState,
  DevtoolsStore,
  HighlightElement,
  RenderDevtools,
  SetDevtoolsMessage,
  StoredNode,
} from './types'
import {
  BUBBLE_MARGIN,
  BUBBLE_SIZE,
  CONTEXT_SYNC_ATTRIBUTES,
  DRAG_THRESHOLD,
} from './constants'
import {
  clamp,
  resolvePanelTop,
  rightDockScrollbarWidth,
  rightDockViewportEdge,
  viewportHeight,
  viewportWidth,
} from './geometry'
import { resolveEventNode, scrollSelectedNodeIntoView } from './render'
import { openNodeSource } from './sourceOpen'
import { resolvePickedNode } from './tree'

/**
 * 激活并定位一个源码节点。
 *
 * 该函数会更新面板选择态、执行高亮、滚动到树节点，并请求编辑器打开源码。
 */
function activateSourceNode(
  node: StoredNode,
  getNodeLookupRoot: () => HTMLElement,
  state: DevtoolsRenderState,
  render: RenderDevtools,
  highlight: HighlightElement,
  setMessage: SetDevtoolsMessage,
) {
  state.activeFormId = node.formId
  state.activeFormSelectedByUser = true
  state.selectedNodeId = node.id
  render()
  const nodeLookupRoot = getNodeLookupRoot()
  highlight(node.element)
  scrollSelectedNodeIntoView(nodeLookupRoot, node.id)
  void openNodeSource(node, setMessage)
}

/**
 * 同步浮层按钮和面板位置。
 *
 * 按左右停靠边界写入样式，不保存持久化位置。
 */
export function updateBubblePosition(bubble: HTMLElement, panel: HTMLElement, position: BubblePosition) {
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

/**
 * 安装浮层按钮拖拽交互。
 *
 * 拖拽结束后按钮吸附到左右边缘；内部状态只保存在当前页面会话。
 */
export function installBubbleDrag(bubble: HTMLElement, panel: HTMLElement) {
  /** 计算按钮在当前视口内允许的最大 left。 */
  const maxLeft = () => Math.max(0, rightDockViewportEdge() - BUBBLE_SIZE)
  /** 计算按钮在当前视口内允许的最大 top。 */
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

  /**
   * 将拖拽后的按钮吸附到最近水平边缘。
   *
   * 吸附后同步面板位置，避免面板和按钮分离。
   */
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

/**
 * 安装 devtools 面板拖拽交互。
 *
 * 只允许通过 header 拖拽，点击 header 内按钮时不会启动拖动。
 */
export function installPanelDrag(panel: HTMLElement, handle: HTMLElement) {
  let dragStartX = 0
  let dragStartY = 0
  let panelStartLeft = 0
  let panelStartTop = 0
  let panelWidth = 0
  let panelHeight = 0
  let dragging = false

  /** 计算面板在当前视口内允许的最大 left。 */
  function maxLeft() {
    return Math.max(BUBBLE_MARGIN, rightDockViewportEdge() - BUBBLE_MARGIN - panelWidth)
  }

  /** 计算面板在当前视口内允许的最大 top。 */
  function maxTop() {
    return Math.max(BUBBLE_MARGIN, viewportHeight() - BUBBLE_MARGIN - panelHeight)
  }

  /**
   * 移动面板到指定位置。
   *
   * 坐标会被限制在视口安全边界内，并切换为 left/top 定位。
   */
  function movePanel(left: number, top: number) {
    panel.style.bottom = 'auto'
    panel.style.left = `${clamp(left, BUBBLE_MARGIN, maxLeft())}px`
    panel.style.right = 'auto'
    panel.style.top = `${clamp(top, BUBBLE_MARGIN, maxTop())}px`
  }

  handle.addEventListener('mousedown', (event) => {
    if (event.button !== 0)
      return
    if (event.target instanceof Element && event.target.closest('button'))
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

/**
 * 安装页面拾取模式。
 *
 * 用户点击页面元素后解析最匹配的 ConfigForm 节点，并打开对应源码位置。
 */
export function installPagePicker(
  root: HTMLElement,
  panel: HTMLElement,
  pickButton: HTMLElement,
  store: DevtoolsStore,
  state: DevtoolsRenderState,
  render: RenderDevtools,
  highlight: HighlightElement,
  setMessage: SetDevtoolsMessage,
) {
  let previousCursor = ''

  /**
   * 切换页面拾取状态。
   *
   * 激活时保存原始 cursor，关闭时必须恢复，避免污染页面全局样式。
   */
  function setPicking(active: boolean) {
    if (state.pickingNode === active)
      return

    state.pickingNode = active
    pickButton.classList.toggle('is-active', active)
    pickButton.setAttribute('aria-pressed', String(active))

    if (active) {
      previousCursor = document.documentElement.style.cursor
      document.documentElement.style.cursor = 'crosshair'
      return
    }

    document.documentElement.style.cursor = previousCursor
  }

  pickButton.addEventListener('mousedown', event => event.stopPropagation())
  pickButton.addEventListener('click', (event) => {
    event.stopPropagation()
    setPicking(!state.pickingNode)
    setMessage(state.pickingNode ? 'Click a ConfigForm field or component in the page' : '')
    if (!state.pickingNode)
      highlight(null)
  })

  document.addEventListener('mousemove', (event) => {
    if (!state.pickingNode)
      return

    const target = event.target
    if (!(target instanceof Node) || root.contains(target)) {
      highlight(null)
      return
    }

    const node = resolvePickedNode(store, target)
    highlight(node?.element ?? null)
  }, { capture: true })

  document.addEventListener('keydown', (event) => {
    if (!state.pickingNode || event.key !== 'Escape')
      return

    setPicking(false)
    setMessage('')
    highlight(null)
  }, { capture: true })

  document.addEventListener('click', (event) => {
    if (!state.pickingNode)
      return

    const target = event.target
    if (target instanceof Node && root.contains(target))
      return

    event.preventDefault()
    event.stopImmediatePropagation()

    if (!(target instanceof Node)) {
      setPicking(false)
      setMessage('No ConfigForm field/component found at this point')
      highlight(null)
      return
    }

    const node = resolvePickedNode(store, target)
    setPicking(false)

    if (!node) {
      setMessage('No ConfigForm field/component found at this point')
      highlight(null)
      return
    }

    panel.classList.add('is-open')
    setMessage('')
    activateSourceNode(node, () => panel, state, render, highlight, setMessage)
  }, { capture: true })

  return () => setPicking(false)
}

/**
 * 安装调试面板树、导航和源码搜索交互。
 *
 * 事件代理只处理 eventHost 内部元素，页面选择逻辑由 installPagePicker 负责。
 */
export function installTreeInteractions(
  eventHost: HTMLElement,
  getBody: () => HTMLElement,
  getNodeLookupRoot: () => HTMLElement,
  store: DevtoolsStore,
  state: DevtoolsRenderState,
  render: RenderDevtools,
  highlight: HighlightElement,
  setMessage: SetDevtoolsMessage,
) {
  eventHost.addEventListener('mouseover', (event) => {
    const body = getBody()
    const node = resolveEventNode(store, body, event.target)
    if (node)
      highlight(node.element)
  })

  eventHost.addEventListener('mouseout', (event) => {
    const body = getBody()
    const target = event.target
    if (!(target instanceof Element))
      return

    const row = target.closest('[data-cf-devtools-node-id]')
    if (!row || !body.contains(row))
      return

    const relatedTarget = event.relatedTarget
    if (relatedTarget instanceof Node && row.contains(relatedTarget))
      return

    highlight(null)
  })

  eventHost.addEventListener('click', (event) => {
    const target = event.target
    if (target instanceof Element) {
      const sourceResult = target.closest<HTMLButtonElement>('[data-cf-devtools-source-result-id]')
      if (sourceResult && eventHost.contains(sourceResult)) {
        const node = store.nodes.get(sourceResult.dataset.cfDevtoolsSourceResultId ?? '')
        if (node)
          activateSourceNode(node, getNodeLookupRoot, state, render, highlight, setMessage)
        return
      }

      const navItem = target.closest<HTMLButtonElement>('[data-cf-devtools-nav-form-id]')
      if (navItem && !navItem.disabled) {
        state.activeFormId = navItem.dataset.cfDevtoolsNavFormId
        state.activeFormSelectedByUser = true
        state.selectedNodeId = undefined
        render()
        return
      }
    }

    const body = getBody()
    const node = resolveEventNode(store, body, event.target)
    if (node)
      activateSourceNode(node, getNodeLookupRoot, state, render, highlight, setMessage)
  })

  eventHost.addEventListener('input', (event) => {
    const target = event.target
    if (!(target instanceof HTMLInputElement) || !target.dataset.cfDevtoolsSourceSearch)
      return

    state.sourceSearchQuery = target.value
    render()

    const nextSearch = getBody().querySelector<HTMLInputElement>('[data-cf-devtools-source-search]')
    if (!nextSearch)
      return

    nextSearch.focus()
    const cursor = nextSearch.value.length
    nextSearch.setSelectionRange(cursor, cursor)
  })

  eventHost.addEventListener('keydown', (event) => {
    const target = event.target
    if (!(target instanceof HTMLInputElement) || !target.dataset.cfDevtoolsSourceSearch || event.key !== 'Enter')
      return

    const firstResult = getBody().querySelector<HTMLButtonElement>('[data-cf-devtools-source-result-id]')
    const node = firstResult ? store.nodes.get(firstResult.dataset.cfDevtoolsSourceResultId ?? '') : undefined
    if (!node)
      return

    event.preventDefault()
    target.blur()
    if (state.sourceSearchQuery !== target.value)
      state.sourceSearchQuery = target.value

    activateSourceNode(node, getNodeLookupRoot, state, render, highlight, setMessage)
  })
}

/**
 * 安装点击外部关闭面板的行为。
 *
 * 点击浮层按钮或面板内部不会触发关闭，避免和内部按钮交互冲突。
 */
export function installOutsidePanelClose(bubble: HTMLElement, panel: HTMLElement, closePanel: () => void) {
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

/**
 * 创建异步渲染调度器。
 *
 * 同一帧内多次触发只执行一次 render；缺少 requestAnimationFrame 时使用宏任务调度。
 */
function createAsyncRenderScheduler(render: RenderDevtools): RenderDevtools {
  let pending = false

  return () => {
    if (pending)
      return

    pending = true
    /** 刷新一次待处理渲染任务。 */
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

/**
 * 安装外部页面上下文变更同步。
 *
 * 页面点击、键盘、滚动、尺寸和可见性属性变化会重新计算当前活跃表单。
 */
export function installExternalContextSync(root: HTMLElement, render: RenderDevtools, resetManualSelection: () => void) {
  const scheduleRender = createAsyncRenderScheduler(render)
  let internalScrollInputUntil = 0
  /**
   * 重置用户手动选择并调度一次自动渲染。
   *
   * 仅用于外部页面上下文变化，面板内部操作不调用该路径。
   */
  const scheduleAutoRender = () => {
    resetManualSelection()
    scheduleRender()
  }
  /** 标记面板内部滚动输入的短暂隔离窗口。 */
  const markInternalScrollInput = () => {
    internalScrollInputUntil = Date.now() + 250
  }
  /**
   * 处理页面滚动触发的自动渲染。
   *
   * 面板内部滚动和短窗口内的 wheel 连带 scroll 不会重置用户选择。
   */
  const scheduleAutoRenderForScroll = (event: Event) => {
    const target = event.target
    if (target instanceof Node && root.contains(target))
      return
    // 仅隔离调试器内部 wheel 对自动选中逻辑的影响；滚动条仍由 CSS overflow 与浏览器原生滚动产生。
    if (Date.now() <= internalScrollInputUntil)
      return

    scheduleAutoRender()
  }

  root.addEventListener('wheel', markInternalScrollInput, { capture: true, passive: true })

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

  window.addEventListener('scroll', scheduleAutoRenderForScroll, { capture: true, passive: true })
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
