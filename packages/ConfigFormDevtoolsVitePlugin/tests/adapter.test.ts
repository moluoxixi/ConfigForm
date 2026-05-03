// @vitest-environment happy-dom
import type { Component } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, defineComponent, h, nextTick, ref } from 'vue'
import { createDevtoolsConfigFormAdapter } from '../src/adapter'

const source = {
  column: 3,
  file: 'D:/project-new/ConfigForm/playgrounds/demo.vue',
  id: 'source-1',
  line: 12,
}

interface FieldStub {
  component: unknown
  field?: string
  label?: unknown
  slots?: Record<string, unknown>
  __source?: typeof source
}

function createBridge() {
  return {
    recordPatch: vi.fn(),
    registerField: vi.fn(),
    unregisterField: vi.fn(),
    updateField: vi.fn(),
  }
}

const CoreConfigForm = defineComponent({
  name: 'CoreConfigFormStub',
  props: {
    fields: { type: Array, required: true },
    namespace: { type: String, default: 'cf' },
  },
  setup(props, { expose }) {
    expose({
      submit: () => Promise.resolve(true),
    })

    return () => h('form', props.fields.map((field) => {
      const config = field as FieldStub
      return h('input', {
        id: `${props.namespace}-${config.field}-field`,
        value: '',
      })
    }))
  },
})

function mountAdapter(fields: FieldStub[]) {
  const Adapter = createDevtoolsConfigFormAdapter({
    ConfigForm: CoreConfigForm as Component,
    collectFieldConfigs: nodes => nodes as never,
  })
  const root = document.createElement('div')
  document.body.append(root)
  const app = createApp({
    render: () => h(Adapter, {
      fields,
      namespace: 'demo',
    }),
  })

  app.mount(root)
  return { app, root }
}

function createAdapter() {
  return createDevtoolsConfigFormAdapter({
    ConfigForm: CoreConfigForm as Component,
    collectFieldConfigs: nodes => nodes as never,
  })
}

describe('configForm devtools adapter', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    delete (window as typeof window & { __CONFIG_FORM_DEVTOOLS_BRIDGE__?: unknown }).__CONFIG_FORM_DEVTOOLS_BRIDGE__
    vi.restoreAllMocks()
  })

  it('registers rendered ConfigForm fields with source metadata and DOM elements', async () => {
    const bridge = createBridge()
    window.__CONFIG_FORM_DEVTOOLS_BRIDGE__ = bridge

    mountAdapter([
      {
        __source: source,
        component: 'input',
        field: 'name',
        label: 'Name',
      },
    ])
    await nextTick()
    await nextTick()

    expect(bridge.registerField).toHaveBeenCalledWith(expect.objectContaining({
      field: 'name',
      formId: expect.stringMatching(/^cf-form-/),
      kind: 'field',
      label: 'Name',
      source,
    }), expect.any(HTMLInputElement))
    expect(bridge.recordPatch).toHaveBeenCalledWith(expect.objectContaining({
      duration: expect.any(Number),
      timestamp: expect.any(Number),
    }))
  })

  it('registers slot component nodes as children of their owning field', async () => {
    const bridge = createBridge()
    window.__CONFIG_FORM_DEVTOOLS_BRIDGE__ = bridge

    mountAdapter([
      {
        component: 'radio-group',
        field: 'gender',
        slots: {
          default: [
            {
              __source: source,
              component: { name: 'RadioOption' },
              slots: {
                default: 'Male',
              },
            },
          ],
        },
      },
    ])
    await nextTick()
    await nextTick()

    const fieldNode = bridge.registerField.mock.calls.find(([node]) => node.field === 'gender')?.[0]
    const optionNode = bridge.registerField.mock.calls.find(([node]) => node.component === 'RadioOption')?.[0]

    expect(fieldNode).toMatchObject({
      field: 'gender',
      kind: 'field',
    })
    expect(optionNode).toMatchObject({
      kind: 'component',
      parentId: fieldNode.id,
      slotName: 'default',
      source,
    })
  })

  it('registers slot field nodes with source metadata for source jumping', async () => {
    const bridge = createBridge()
    window.__CONFIG_FORM_DEVTOOLS_BRIDGE__ = bridge
    const childSource = {
      ...source,
      id: 'source-child',
      line: 24,
    }

    mountAdapter([
      {
        component: 'input-group',
        field: 'account',
        slots: {
          default: [
            {
              __source: childSource,
              component: 'input',
              field: 'accountSuffix',
            },
          ],
        },
      },
    ])
    await nextTick()
    await nextTick()

    const fieldNode = bridge.registerField.mock.calls.find(([node]) => node.field === 'account')?.[0]
    const childNode = bridge.registerField.mock.calls.find(([node]) => node.field === 'accountSuffix')?.[0]

    expect(childNode).toMatchObject({
      field: 'accountSuffix',
      kind: 'field',
      parentId: fieldNode.id,
      slotName: 'default',
      source: childSource,
    })
  })

  it('registers nested slot containers and final input nodes with source metadata', async () => {
    const bridge = createBridge()
    window.__CONFIG_FORM_DEVTOOLS_BRIDGE__ = bridge
    const outerSource = {
      ...source,
      id: 'source-outer',
      line: 20,
    }
    const innerSource = {
      ...source,
      id: 'source-inner',
      line: 24,
    }
    const inputSource = {
      ...source,
      id: 'source-input',
      line: 28,
    }

    mountAdapter([
      {
        __source: outerSource,
        component: { name: 'OuterContainer' },
        slots: {
          default: [
            {
              __source: innerSource,
              component: { name: 'InnerContainer' },
              slots: {
                default: [
                  {
                    __source: inputSource,
                    component: 'input',
                    field: 'nestedInput',
                  },
                ],
              },
            },
          ],
        },
      },
    ])
    await nextTick()
    await nextTick()

    const outerNode = bridge.registerField.mock.calls.find(([node]) => node.component === 'OuterContainer')?.[0]
    const innerNode = bridge.registerField.mock.calls.find(([node]) => node.component === 'InnerContainer')?.[0]
    const inputNode = bridge.registerField.mock.calls.find(([node]) => node.field === 'nestedInput')?.[0]

    expect(outerNode).toMatchObject({
      kind: 'component',
      parentId: undefined,
      source: outerSource,
    })
    expect(innerNode).toMatchObject({
      kind: 'component',
      parentId: outerNode.id,
      slotName: 'default',
      source: innerSource,
    })
    expect(inputNode).toMatchObject({
      field: 'nestedInput',
      kind: 'field',
      parentId: innerNode.id,
      slotName: 'default',
      source: inputSource,
    })
  })

  it('resolves component node elements from their devtools source ids', async () => {
    const bridge = createBridge()
    window.__CONFIG_FORM_DEVTOOLS_BRIDGE__ = bridge
    const containerSource = {
      ...source,
      id: 'source-container-element',
      line: 20,
    }
    const containerElement = document.createElement('section')
    containerElement.dataset.cfDevtoolsSourceId = containerSource.id
    document.body.append(containerElement)

    mountAdapter([
      {
        __source: containerSource,
        component: { name: 'CardContainer' },
        slots: {
          default: [
            {
              component: 'input',
              field: 'name',
            },
          ],
        },
      },
    ])
    await nextTick()
    await nextTick()

    expect(bridge.registerField).toHaveBeenCalledWith(expect.objectContaining({
      component: 'CardContainer',
      kind: 'component',
      source: containerSource,
    }), containerElement)
  })

  it('resolves visible source elements before hidden duplicate source nodes', async () => {
    const bridge = createBridge()
    window.__CONFIG_FORM_DEVTOOLS_BRIDGE__ = bridge
    const sharedSource = {
      ...source,
      id: 'source-shared-container',
      line: 20,
    }

    const CoreWithVisibleContainer = defineComponent({
      name: 'CoreWithVisibleContainer',
      props: {
        fields: { type: Array, required: true },
      },
      setup(props) {
        return () => h('form', props.fields.map((field) => {
          const config = field as FieldStub
          return h('div', [
            h('span', {
              'data-cf-devtools-source-id': config.__source?.id,
              'style': 'display: none;',
            }),
            h('section', {
              'data-cf-devtools-source-id': config.__source?.id,
              'ref': (element) => {
                if (element instanceof HTMLElement) {
                  element.getBoundingClientRect = () => ({
                    bottom: 60,
                    height: 40,
                    left: 10,
                    right: 210,
                    top: 20,
                    width: 200,
                    x: 10,
                    y: 20,
                    toJSON: () => ({}),
                  })
                }
              },
            }),
          ])
        }))
      },
    })
    const Adapter = createDevtoolsConfigFormAdapter({
      ConfigForm: CoreWithVisibleContainer as Component,
      collectFieldConfigs: nodes => nodes as never,
    })
    const root = document.createElement('div')
    document.body.append(root)
    const app = createApp({
      render: () => h(Adapter, {
        fields: [{
          __source: sharedSource,
          component: { name: 'CardContainer' },
        }],
      }),
    })

    app.mount(root)
    await nextTick()
    await nextTick()

    const visibleContainer = root.querySelectorAll<HTMLElement>('[data-cf-devtools-source-id="source-shared-container"]')[1]
    expect(bridge.registerField).toHaveBeenCalledWith(expect.objectContaining({
      component: 'CardContainer',
      kind: 'component',
      source: sharedSource,
    }), visibleContainer)

    app.unmount()
  })

  it('registers the surrounding tab label as the devtools form label', async () => {
    const bridge = createBridge()
    window.__CONFIG_FORM_DEVTOOLS_BRIDGE__ = bridge
    const label = document.createElement('button')
    label.id = 'tab-nested-card-checkbox'
    label.textContent = 'element Card 嵌套 Checkbox'
    document.body.append(label)

    const Adapter = createAdapter()
    const root = document.createElement('div')
    root.setAttribute('aria-labelledby', label.id)
    root.setAttribute('role', 'tabpanel')
    document.body.append(root)
    const app = createApp({
      render: () => h(Adapter, {
        fields: [
          {
            component: 'input',
            field: 'permissionScopes',
          },
        ],
        namespace: 'demo',
      }),
    })

    app.mount(root)
    await nextTick()
    await nextTick()

    expect(bridge.registerField).toHaveBeenCalledWith(expect.objectContaining({
      field: 'permissionScopes',
      formLabel: 'element Card 嵌套 Checkbox',
    }), expect.any(HTMLInputElement))

    app.unmount()
  })

  it('does not register plain Vue VNodes returned from slot functions as devtools nodes', async () => {
    const bridge = createBridge()
    window.__CONFIG_FORM_DEVTOOLS_BRIDGE__ = bridge

    mountAdapter([
      {
        component: 'input-group',
        field: 'account',
        slots: {
          default: () => h('span', 'plain suffix'),
        },
      },
    ])
    await nextTick()
    await nextTick()

    expect(bridge.registerField).toHaveBeenCalledTimes(1)
    expect(bridge.registerField).toHaveBeenCalledWith(expect.objectContaining({
      field: 'account',
      kind: 'field',
    }), expect.any(HTMLInputElement))
  })

  it('unregisters devtools nodes when the wrapped form unmounts', async () => {
    const bridge = createBridge()
    window.__CONFIG_FORM_DEVTOOLS_BRIDGE__ = bridge

    const { app } = mountAdapter([
      {
        component: 'input',
        field: 'name',
      },
    ])
    await nextTick()
    await nextTick()

    const registeredNode = bridge.registerField.mock.calls[0]?.[0]
    app.unmount()

    expect(bridge.unregisterField).toHaveBeenCalledWith(registeredNode.id)
  })

  it('registers after the devtools bridge becomes ready', async () => {
    const bridge = createBridge()

    mountAdapter([
      {
        component: 'input',
        field: 'late',
      },
    ])
    await nextTick()
    await nextTick()
    expect(bridge.registerField).not.toHaveBeenCalled()

    window.__CONFIG_FORM_DEVTOOLS_BRIDGE__ = bridge
    window.dispatchEvent(new CustomEvent('config-form-devtools:ready'))
    await nextTick()
    await nextTick()

    expect(bridge.registerField).toHaveBeenCalledWith(expect.objectContaining({
      field: 'late',
    }), expect.any(HTMLInputElement))
  })

  it('updates existing nodes and unregisters removed fields', async () => {
    const bridge = createBridge()
    window.__CONFIG_FORM_DEVTOOLS_BRIDGE__ = bridge
    const fields = ref<FieldStub[]>([
      {
        component: 'input',
        field: 'name',
        label: 'Name',
      },
      {
        component: 'input',
        field: 'role',
      },
    ])
    const Adapter = createAdapter()
    const root = document.createElement('div')
    document.body.append(root)
    const app = createApp({
      render: () => h(Adapter, {
        fields: fields.value,
        namespace: 'demo',
      }),
    })

    app.mount(root)
    await nextTick()
    await nextTick()
    const removedId = bridge.registerField.mock.calls.find(([node]) => node.field === 'role')?.[0].id
    bridge.registerField.mockClear()
    bridge.updateField.mockClear()
    bridge.unregisterField.mockClear()

    function NamedInput() {}
    fields.value = [
      {
        component: NamedInput,
        field: 'name',
      },
      {
        component: { __name: 'ObjectInput' },
        field: 'email',
      },
    ]
    await nextTick()
    await nextTick()

    expect(bridge.unregisterField).toHaveBeenCalledWith(removedId)
    expect(bridge.updateField).toHaveBeenCalledWith(expect.objectContaining({
      component: 'NamedInput',
      field: 'name',
      label: undefined,
    }), expect.any(HTMLInputElement))
    expect(bridge.registerField).toHaveBeenCalledWith(expect.objectContaining({
      component: 'ObjectInput',
      field: 'email',
    }), expect.any(HTMLInputElement))

    app.unmount()
  })

  it('keeps unnamed component metadata explicit instead of inventing labels', async () => {
    const bridge = createBridge()
    window.__CONFIG_FORM_DEVTOOLS_BRIDGE__ = bridge
    const anonymousComponent = Object.defineProperty(() => null, 'name', { value: '' })

    mountAdapter([
      {
        component: {},
        field: 'plain',
        label: 123,
      },
      {
        component: anonymousComponent,
        field: 'anonymous',
      },
    ])
    await nextTick()
    await nextTick()

    expect(bridge.registerField).toHaveBeenCalledWith(expect.objectContaining({
      component: undefined,
      field: 'plain',
      label: undefined,
    }), expect.any(HTMLInputElement))
    expect(bridge.registerField).toHaveBeenCalledWith(expect.objectContaining({
      component: undefined,
      field: 'anonymous',
    }), expect.any(HTMLInputElement))
  })

  it('reads object component names when Vue exposes a public name', async () => {
    const bridge = createBridge()
    window.__CONFIG_FORM_DEVTOOLS_BRIDGE__ = bridge

    mountAdapter([
      {
        component: { name: 'NamedObjectInput' },
        field: 'named',
      },
    ])
    await nextTick()
    await nextTick()

    expect(bridge.registerField).toHaveBeenCalledWith(expect.objectContaining({
      component: 'NamedObjectInput',
      field: 'named',
    }), expect.any(HTMLInputElement))
  })

  it('proxies exposed ConfigForm methods and throws when the wrapped method is missing', async () => {
    const Adapter = createAdapter()
    const exposed = ref<Record<string, (...args: unknown[]) => unknown> | null>(null)
    const root = document.createElement('div')
    document.body.append(root)
    createApp({
      render: () => h(Adapter, {
        fields: [
          {
            component: 'input',
            field: 'name',
          },
        ],
        namespace: 'demo',
        ref: exposed,
      }),
    }).mount(root)
    await nextTick()

    await expect(exposed.value?.submit()).resolves.toBe(true)
    expect(() => exposed.value?.validate()).toThrow(/is not available/)
  })

  it('does not unregister through a bridge that disappeared before unmount', async () => {
    const bridge = createBridge()
    window.__CONFIG_FORM_DEVTOOLS_BRIDGE__ = bridge

    const { app } = mountAdapter([
      {
        component: 'input',
        field: 'name',
      },
    ])
    await nextTick()
    await nextTick()
    bridge.unregisterField.mockClear()

    delete (window as typeof window & { __CONFIG_FORM_DEVTOOLS_BRIDGE__?: unknown }).__CONFIG_FORM_DEVTOOLS_BRIDGE__
    app.unmount()

    expect(bridge.unregisterField).not.toHaveBeenCalled()
  })
})
