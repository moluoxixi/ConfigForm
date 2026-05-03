// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { installConfigFormDevtools } from '../src/client'

describe('client overlay', () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
    document.body.innerHTML = ''
    delete (window as typeof window & { __CONFIG_FORM_DEVTOOLS_BRIDGE__?: unknown }).__CONFIG_FORM_DEVTOOLS_BRIDGE__
    delete (window as typeof window & { __CONFIG_FORM_DEVTOOLS_PENDING__?: unknown }).__CONFIG_FORM_DEVTOOLS_PENDING__
    vi.restoreAllMocks()
  })

  it('mounts a bubble, renders field nodes, highlights elements, and opens source locations', async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => new Response(JSON.stringify({ ok: true }), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    installConfigFormDevtools()

    const target = document.createElement('div')
    target.getBoundingClientRect = () => ({
      bottom: 40,
      height: 30,
      left: 10,
      right: 110,
      top: 10,
      width: 100,
      x: 10,
      y: 10,
      toJSON: () => ({}),
    })
    document.body.append(target)

    expect(document.head.textContent).toContain('translateX(20px)')

    window.__CONFIG_FORM_DEVTOOLS_BRIDGE__?.registerField({
      kind: 'field',
      field: 'username',
      formId: 'form-1',
      id: 'node-1',
      label: '用户名',
      source: {
        column: 5,
        file: 'D:/project-new/ConfigForm/playgrounds/element-plus-playground/src/demos/GridForm.vue',
        id: 'source-1',
        line: 32,
      },
    }, target)
    window.__CONFIG_FORM_DEVTOOLS_BRIDGE__?.recordPatch({
      duration: 12.34,
      id: 'node-1',
      timestamp: 1,
    })
    window.__CONFIG_FORM_DEVTOOLS_BRIDGE__?.recordPatch({
      duration: 13.45,
      id: 'node-1',
      timestamp: 2,
    })
    window.__CONFIG_FORM_DEVTOOLS_BRIDGE__?.registerField({
      kind: 'field',
      field: 'username-option',
      formId: 'form-1',
      id: 'node-2',
      parentId: 'node-1',
      slotName: 'default',
    }, null)

    document.querySelector<HTMLButtonElement>('[data-cf-devtools="bubble"]')?.click()

    expect(document.body.textContent).toContain('username')
    expect(document.body.textContent).toContain('slot:default')
    expect(document.body.textContent).toContain('用户名')
    expect(document.body.textContent).toContain('13.45')

    document.querySelector<HTMLElement>('[data-cf-devtools-node-id="node-1"]')?.dispatchEvent(new MouseEvent('mouseenter'))

    const highlight = document.querySelector<HTMLElement>('[data-cf-devtools="highlight"]')
    expect(highlight?.style.display).toBe('block')
    expect(highlight?.style.left).toBe('10px')

    document.querySelector<HTMLElement>('[data-cf-devtools-node-id="node-1"]')?.dispatchEvent(new MouseEvent('mouseleave'))
    expect(highlight?.style.display).toBe('none')

    document.querySelector<HTMLButtonElement>('[data-cf-devtools-open="node-1"]')?.click()
    await vi.waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/__config-form-devtools/open', expect.objectContaining({
        method: 'POST',
      }))
    })
    expect(String(fetchMock.mock.calls[0]?.[1]?.body)).toContain('"line":32')
  })

  it('renders field and component node text badges beside display names', () => {
    installConfigFormDevtools()

    window.__CONFIG_FORM_DEVTOOLS_BRIDGE__?.registerField({
      kind: 'field',
      field: 'gender',
      formId: 'form-1',
      id: 'field-gender',
      label: '性别',
      order: 1,
    }, null)
    window.__CONFIG_FORM_DEVTOOLS_BRIDGE__?.registerField({
      kind: 'component',
      component: 'ElRadio',
      formId: 'form-1',
      id: 'component-radio',
      order: 2,
      parentId: 'field-gender',
      slotName: 'default',
    }, null)

    document.querySelector<HTMLButtonElement>('[data-cf-devtools="bubble"]')?.click()

    const fieldRow = document.querySelector<HTMLElement>('[data-cf-devtools-node-id="field-gender"]')
    const componentRow = document.querySelector<HTMLElement>('[data-cf-devtools-node-id="component-radio"]')

    expect(fieldRow?.querySelector('.cf-devtools-node-kind')?.textContent).toBe('F')
    expect(fieldRow?.querySelector('.cf-devtools-node-key')?.textContent).toBe('gender')
    expect(componentRow?.querySelector('.cf-devtools-node-kind')?.textContent).toBe('C')
    expect(componentRow?.querySelector('.cf-devtools-node-key')?.textContent).toBe('ElRadio')
    expect(componentRow?.textContent).toContain('slot:default')
  })

  it('closes the panel when clicking outside the debugger overlay', () => {
    installConfigFormDevtools()

    const bubble = document.querySelector<HTMLButtonElement>('[data-cf-devtools="bubble"]')
    const panel = document.querySelector<HTMLElement>('[data-cf-devtools="panel"]')

    if (!bubble || !panel)
      throw new Error('Expected devtools bubble and panel to exist')

    bubble.click()
    expect(panel.classList.contains('is-open')).toBe(true)

    panel.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(panel.classList.contains('is-open')).toBe(true)

    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(panel.classList.contains('is-open')).toBe(false)
  })

  it('renders explicit field order even when nodes register out of render order', () => {
    installConfigFormDevtools()

    window.__CONFIG_FORM_DEVTOOLS_BRIDGE__?.registerField({
      field: 'first-child-b',
      formId: 'form-1',
      id: 'first-child-b',
      kind: 'field',
      order: 3,
      parentId: 'first-root',
    }, null)
    window.__CONFIG_FORM_DEVTOOLS_BRIDGE__?.registerField({
      field: 'second-root',
      formId: 'form-1',
      id: 'second-root',
      kind: 'field',
      order: 4,
    }, null)
    window.__CONFIG_FORM_DEVTOOLS_BRIDGE__?.registerField({
      field: 'first-child-a',
      formId: 'form-1',
      id: 'first-child-a',
      kind: 'field',
      order: 2,
      parentId: 'first-root',
    }, null)
    window.__CONFIG_FORM_DEVTOOLS_BRIDGE__?.registerField({
      field: 'first-root',
      formId: 'form-1',
      id: 'first-root',
      kind: 'field',
      order: 1,
    }, null)

    document.querySelector<HTMLButtonElement>('[data-cf-devtools="bubble"]')?.click()

    expect([...document.querySelectorAll<HTMLElement>('[data-cf-devtools-node-id]')]
      .map(node => node.dataset.cfDevtoolsNodeId))
      .toEqual(['first-root', 'first-child-a', 'first-child-b', 'second-root'])
  })

  it('preserves the field registration order for roots and nested slot fields', () => {
    installConfigFormDevtools()

    window.__CONFIG_FORM_DEVTOOLS_BRIDGE__?.registerField({
      kind: 'field',
      field: 'zeta',
      formId: 'form-1',
      id: 'root-zeta',
    }, null)
    window.__CONFIG_FORM_DEVTOOLS_BRIDGE__?.registerField({
      kind: 'field',
      field: 'z-child',
      formId: 'form-1',
      id: 'child-z',
      parentId: 'root-zeta',
    }, null)
    window.__CONFIG_FORM_DEVTOOLS_BRIDGE__?.registerField({
      kind: 'field',
      field: 'a-child',
      formId: 'form-1',
      id: 'child-a',
      parentId: 'root-zeta',
    }, null)
    window.__CONFIG_FORM_DEVTOOLS_BRIDGE__?.registerField({
      kind: 'field',
      field: 'alpha',
      formId: 'form-1',
      id: 'root-alpha',
    }, null)

    document.querySelector<HTMLButtonElement>('[data-cf-devtools="bubble"]')?.click()

    expect([...document.querySelectorAll<HTMLElement>('[data-cf-devtools-node-id]')]
      .map(node => node.dataset.cfDevtoolsNodeId))
      .toEqual(['root-zeta', 'child-z', 'child-a', 'root-alpha'])
  })

  it('drags the bubble, snaps it to an edge, and suppresses the drag click', () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 800 })
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 600 })

    installConfigFormDevtools()

    const bubble = document.querySelector<HTMLButtonElement>('[data-cf-devtools="bubble"]')
    const panel = document.querySelector<HTMLElement>('[data-cf-devtools="panel"]')

    if (!bubble || !panel)
      throw new Error('Expected devtools bubble and panel to exist')

    expect(bubble.style.left).toBe('742px')
    expect(bubble.classList.contains('is-right-edge')).toBe(true)

    bubble.dispatchEvent(new MouseEvent('mousedown', {
      bubbles: true,
      button: 0,
      cancelable: true,
      clientX: 760,
      clientY: 550,
    }))
    document.dispatchEvent(new MouseEvent('mousemove', {
      bubbles: true,
      clientX: 20,
      clientY: 80,
    }))
    document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }))

    expect(bubble.style.left).toBe('0px')
    expect(bubble.classList.contains('is-left-edge')).toBe(true)
    expect(panel.style.left).toBe('16px')

    bubble.click()
    expect(panel.classList.contains('is-open')).toBe(false)

    bubble.click()
    expect(panel.classList.contains('is-open')).toBe(true)

    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 300 })
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 260 })
    window.dispatchEvent(new Event('resize'))

    expect(bubble.style.left).toBe('0px')
    expect(bubble.style.top).toBe('72px')
  })

  it('ignores non-left drag starts and keeps right-edge placement on resize', () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 500 })
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 400 })

    installConfigFormDevtools()

    const bubble = document.querySelector<HTMLButtonElement>('[data-cf-devtools="bubble"]')
    const panel = document.querySelector<HTMLElement>('[data-cf-devtools="panel"]')

    if (!bubble || !panel)
      throw new Error('Expected devtools bubble and panel to exist')

    expect(bubble.style.left).toBe('442px')

    bubble.dispatchEvent(new MouseEvent('mousedown', {
      bubbles: true,
      button: 2,
      clientX: 450,
      clientY: 350,
    }))
    document.dispatchEvent(new MouseEvent('mousemove', {
      bubbles: true,
      clientX: 10,
      clientY: 10,
    }))
    document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }))

    expect(bubble.style.left).toBe('442px')

    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 360 })
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 280 })
    window.dispatchEvent(new Event('resize'))

    expect(bubble.style.left).toBe('318px')
    expect(panel.style.right).toBe('16px')
  })

  it('snaps dragged bubbles back to the right edge', () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 500 })
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 400 })

    installConfigFormDevtools()

    const bubble = document.querySelector<HTMLButtonElement>('[data-cf-devtools="bubble"]')
    const panel = document.querySelector<HTMLElement>('[data-cf-devtools="panel"]')

    if (!bubble || !panel)
      throw new Error('Expected devtools bubble and panel to exist')

    bubble.dispatchEvent(new MouseEvent('mousedown', {
      bubbles: true,
      button: 0,
      cancelable: true,
      clientX: 450,
      clientY: 350,
    }))
    document.dispatchEvent(new MouseEvent('mousemove', {
      bubbles: true,
      clientX: 451,
      clientY: 300,
    }))
    document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }))

    expect(bubble.style.left).toBe('458px')
    expect(bubble.style.top).toBe('292px')
    expect(bubble.classList.contains('is-right-edge')).toBe(true)

    bubble.click()
    expect(panel.classList.contains('is-open')).toBe(false)
  })

  it('keeps normal click behavior after tiny pointer movement', () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 500 })
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 400 })

    installConfigFormDevtools()

    const bubble = document.querySelector<HTMLButtonElement>('[data-cf-devtools="bubble"]')
    const panel = document.querySelector<HTMLElement>('[data-cf-devtools="panel"]')

    if (!bubble || !panel)
      throw new Error('Expected devtools bubble and panel to exist')

    bubble.dispatchEvent(new MouseEvent('mousedown', {
      bubbles: true,
      button: 0,
      cancelable: true,
      clientX: 450,
      clientY: 350,
    }))
    document.dispatchEvent(new MouseEvent('mousemove', {
      bubbles: true,
      clientX: 452,
      clientY: 352,
    }))
    document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }))
    bubble.click()

    expect(panel.classList.contains('is-open')).toBe(true)
  })

  it('surfaces source open failures in the panel', async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => new Response(JSON.stringify({ error: 'editor failed' }), { status: 500 }))
    vi.stubGlobal('fetch', fetchMock)
    installConfigFormDevtools()

    window.__CONFIG_FORM_DEVTOOLS_BRIDGE__?.registerField({
      kind: 'field',
      field: 'email',
      formId: 'form-1',
      id: 'node-1',
      source: {
        column: 1,
        file: 'D:/project-new/ConfigForm/playgrounds/element-plus-playground/src/demos/GridForm.vue',
        id: 'source-1',
        line: 1,
      },
    }, null)

    document.querySelector<HTMLButtonElement>('[data-cf-devtools="bubble"]')?.click()
    document.querySelector<HTMLButtonElement>('[data-cf-devtools-open="node-1"]')?.click()

    await vi.waitFor(() => {
      expect(document.body.textContent).toContain('editor failed')
    })
  })

  it('shows the returned editor command after opening source', async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => new Response(JSON.stringify({
      command: {
        args: ['--reuse-window', '-g', 'D:/project-new/ConfigForm/playgrounds/demo.vue:12:7'],
        command: 'code.cmd',
      },
    }), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    installConfigFormDevtools()

    window.__CONFIG_FORM_DEVTOOLS_BRIDGE__?.registerField({
      kind: 'field',
      field: 'email',
      formId: 'form-1',
      id: 'node-1',
      source: {
        column: 7,
        file: 'D:/project-new/ConfigForm/playgrounds/demo.vue',
        id: 'source-1',
        line: 12,
      },
    }, null)

    document.querySelector<HTMLButtonElement>('[data-cf-devtools="bubble"]')?.click()
    document.querySelector<HTMLButtonElement>('[data-cf-devtools-open="node-1"]')?.click()

    await vi.waitFor(() => {
      expect(document.body.textContent).toContain('Opened source: code.cmd --reuse-window -g D:/project-new/ConfigForm/playgrounds/demo.vue:12:7')
    })
  })

  it('shows source open success when the editor command has no args', async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => new Response(JSON.stringify({
      command: {
        command: 'custom-editor',
      },
    }), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    installConfigFormDevtools()

    window.__CONFIG_FORM_DEVTOOLS_BRIDGE__?.registerField({
      kind: 'field',
      field: 'email',
      formId: 'form-1',
      id: 'node-1',
      source: {
        column: 7,
        file: 'D:/project-new/ConfigForm/playgrounds/demo.vue',
        id: 'source-1',
        line: 12,
      },
    }, null)

    document.querySelector<HTMLButtonElement>('[data-cf-devtools="bubble"]')?.click()
    document.querySelector<HTMLButtonElement>('[data-cf-devtools-open="node-1"]')?.click()

    await vi.waitFor(() => {
      expect(document.body.textContent).toContain('Opened source: custom-editor')
    })
  })

  it('clears source open status when a successful response is not JSON', async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => new Response('opened', { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    installConfigFormDevtools()

    window.__CONFIG_FORM_DEVTOOLS_BRIDGE__?.registerField({
      kind: 'field',
      field: 'email',
      formId: 'form-1',
      id: 'node-1',
      source: {
        column: 7,
        file: 'D:/project-new/ConfigForm/playgrounds/demo.vue',
        id: 'source-1',
        line: 12,
      },
    }, null)

    document.querySelector<HTMLButtonElement>('[data-cf-devtools="bubble"]')?.click()
    document.querySelector<HTMLButtonElement>('[data-cf-devtools-open="node-1"]')?.click()

    await vi.waitFor(() => {
      expect(fetchMock).toHaveBeenCalled()
    })
    expect(document.body.textContent).not.toContain('Opened source:')
  })

  it('surfaces plain source open failures when the response is not JSON', async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => new Response('plain editor failed', { status: 500 }))
    vi.stubGlobal('fetch', fetchMock)
    installConfigFormDevtools()

    window.__CONFIG_FORM_DEVTOOLS_BRIDGE__?.registerField({
      kind: 'field',
      field: 'email',
      formId: 'form-1',
      id: 'node-1',
      source: {
        column: 1,
        file: 'D:/project-new/ConfigForm/playgrounds/element-plus-playground/src/demos/GridForm.vue',
        id: 'source-1',
        line: 1,
      },
    }, null)

    document.querySelector<HTMLButtonElement>('[data-cf-devtools="bubble"]')?.click()
    document.querySelector<HTMLButtonElement>('[data-cf-devtools-open="node-1"]')?.click()

    await vi.waitFor(() => {
      expect(document.body.textContent).toContain('plain editor failed')
    })
  })

  it('returns the existing bridge on repeated install', () => {
    const first = installConfigFormDevtools()
    const second = installConfigFormDevtools()

    expect(second).toBe(first)
    expect(document.querySelectorAll('#cf-devtools-root')).toHaveLength(1)
  })

  it('dispatches a ready event after installing the bridge', () => {
    const ready = vi.fn()
    window.addEventListener('config-form-devtools:ready', ready)

    const bridge = installConfigFormDevtools()

    expect(ready).toHaveBeenCalledWith(expect.objectContaining({
      detail: bridge,
    }))
    expect(window.__CONFIG_FORM_DEVTOOLS_PENDING__).toBe(true)
  })

  it('throws without a browser document', () => {
    vi.stubGlobal('document', undefined)

    expect(() => installConfigFormDevtools()).toThrow(/requires a browser document/)
  })

  it('updates and unregisters nodes through the bridge', () => {
    installConfigFormDevtools()

    window.__CONFIG_FORM_DEVTOOLS_BRIDGE__?.registerField({
      kind: 'field',
      field: 'role',
      formId: 'form-1',
      id: 'node-1',
    }, null)
    window.__CONFIG_FORM_DEVTOOLS_BRIDGE__?.recordPatch({
      duration: 1.23,
      id: 'node-1',
      timestamp: 1,
    })
    window.__CONFIG_FORM_DEVTOOLS_BRIDGE__?.registerField({
      kind: 'field',
      field: 'role',
      formId: 'form-1',
      id: 'node-1',
      label: '权限',
    }, null)
    window.__CONFIG_FORM_DEVTOOLS_BRIDGE__?.updateField({
      kind: 'field',
      field: 'role',
      formId: 'form-1',
      id: 'node-1',
      label: '角色',
    }, null)

    document.querySelector<HTMLButtonElement>('[data-cf-devtools="bubble"]')?.click()
    expect(document.body.textContent).toContain('角色')

    const openSource = document.querySelector<HTMLButtonElement>('[data-cf-devtools-open="node-1"]')
    expect(openSource?.disabled).toBe(true)

    window.__CONFIG_FORM_DEVTOOLS_BRIDGE__?.unregisterField('node-1')
    expect(document.body.textContent).not.toContain('角色')

    window.__CONFIG_FORM_DEVTOOLS_BRIDGE__?.updateField({
      kind: 'field',
      field: 'created-by-update',
      formId: 'form-1',
      id: 'node-2',
      label: '更新创建',
    }, null)
    expect(document.body.textContent).toContain('更新创建')
  })

  it('throws when a duplicate node id points to a different logical field', () => {
    const bridge = installConfigFormDevtools()

    bridge.registerField({
      field: 'role',
      formId: 'form-1',
      id: 'node-1',
      kind: 'field',
    }, null)

    expect(() => bridge.registerField({
      field: 'status',
      formId: 'form-1',
      id: 'node-1',
      kind: 'field',
    }, null)).toThrow(/Conflicting devtools node id/)
  })

  it('throws when a duplicate node id points to a different source location', () => {
    const bridge = installConfigFormDevtools()

    bridge.registerField({
      field: 'role',
      formId: 'form-1',
      id: 'node-1',
      kind: 'field',
      source: {
        column: 1,
        file: 'D:/project-new/ConfigForm/playgrounds/demo.vue',
        id: 'source-1',
        line: 1,
      },
    }, null)

    expect(() => bridge.updateField({
      field: 'role',
      formId: 'form-1',
      id: 'node-1',
      kind: 'field',
      source: {
        column: 1,
        file: 'D:/project-new/ConfigForm/playgrounds/demo.vue',
        id: 'source-2',
        line: 1,
      },
    }, null)).toThrow(/Conflicting devtools node id/)
  })
})
