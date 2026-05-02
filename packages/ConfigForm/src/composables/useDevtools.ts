import type { ComputedRef, InjectionKey, Ref } from 'vue'
import type {
  FormDevtoolsBridge,
  FormDevtoolsNode,
  FormFieldPatchMetric,
  ResolvedComponentNode,
  ResolvedField,
} from '@/types'
import { computed, inject, onBeforeUnmount, onBeforeUpdate, onMounted, onUpdated, provide } from 'vue'

interface FormDevtoolsContext {
  formId: string
}

interface UseFormFieldDevtoolsOptions {
  field: ComputedRef<ResolvedField>
  rootRef: Ref<unknown>
  slotName: ComputedRef<string | undefined>
}

interface UseFormComponentNodeDevtoolsOptions {
  enabled: boolean
  node: ComputedRef<ResolvedComponentNode | undefined>
  rootRef: Ref<unknown>
  slotName: ComputedRef<string | undefined>
}

interface DevtoolsWindow extends Window {
  __CONFIG_FORM_DEVTOOLS_BRIDGE__?: FormDevtoolsBridge
  __CONFIG_FORM_DEVTOOLS_PENDING__?: boolean
}

const formDevtoolsContextKey: InjectionKey<FormDevtoolsContext> = Symbol('config-form-devtools-form')
const parentFieldNodeIdKey: InjectionKey<string | undefined> = Symbol('config-form-devtools-parent-field')
const devtoolsReadyEvent = 'config-form-devtools:ready'

let formIdSeed = 0
let devtoolsNodeIdSeed = 0

function createFormId(): string {
  return `cf-devtools-form-${++formIdSeed}`
}

function createDevtoolsNodeIdentity(): { id: string, order: number } {
  const order = ++devtoolsNodeIdSeed
  return {
    id: `cf-devtools-node-${order}`,
    order,
  }
}

function resolveComponentName(component: ResolvedComponentNode['component']): string {
  if (typeof component === 'string')
    return component

  const candidate = component as {
    __name?: unknown
    __vccOpts?: { __name?: unknown, name?: unknown }
    displayName?: unknown
    name?: unknown
  }

  const name = candidate.name
    ?? candidate.displayName
    ?? candidate.__name
    ?? candidate.__vccOpts?.name
    ?? candidate.__vccOpts?.__name

  return typeof name === 'string' && name.length > 0 ? name : 'AnonymousComponent'
}

function getBridge(): FormDevtoolsBridge | undefined {
  if (typeof window === 'undefined')
    return undefined

  return (window as DevtoolsWindow).__CONFIG_FORM_DEVTOOLS_BRIDGE__
}

function isDevtoolsEnabled(): boolean {
  if (typeof window === 'undefined')
    return false

  const target = window as DevtoolsWindow
  return Boolean(target.__CONFIG_FORM_DEVTOOLS_PENDING__ || target.__CONFIG_FORM_DEVTOOLS_BRIDGE__)
}

function resolveElement(value: unknown): HTMLElement | null {
  if (value instanceof HTMLElement)
    return value

  const maybeComponent = value as { $el?: unknown } | null | undefined
  return maybeComponent?.$el instanceof HTMLElement ? maybeComponent.$el : null
}

function now(): number {
  return typeof performance === 'undefined' ? Date.now() : performance.now()
}

export function provideFormDevtoolsContext(): FormDevtoolsContext {
  const context = { formId: createFormId() }

  if (isDevtoolsEnabled())
    provide(formDevtoolsContextKey, context)

  return context
}

export function useFormFieldDevtools(options: UseFormFieldDevtoolsOptions) {
  const formContext = inject(formDevtoolsContextKey, undefined)
  const parentId = inject(parentFieldNodeIdKey, undefined)
  const { id: nodeId, order: nodeOrder } = createDevtoolsNodeIdentity()

  provide(parentFieldNodeIdKey, nodeId)

  const node = computed<FormDevtoolsNode | undefined>(() => {
    if (!formContext)
      return undefined

    return {
      field: options.field.value.field,
      formId: formContext.formId,
      id: nodeId,
      kind: 'field',
      label: options.field.value.label,
      order: nodeOrder,
      parentId,
      slotName: options.slotName.value,
      source: options.field.value.__source,
    }
  })

  useDevtoolsNodeRegistration({
    node,
    nodeId,
    rootRef: options.rootRef,
  })
}

export function useFormComponentNodeDevtools(options: UseFormComponentNodeDevtoolsOptions) {
  const formContext = inject(formDevtoolsContextKey, undefined)
  const parentId = inject(parentFieldNodeIdKey, undefined)
  const { id: nodeId, order: nodeOrder } = createDevtoolsNodeIdentity()

  if (options.enabled)
    provide(parentFieldNodeIdKey, nodeId)

  const node = computed<FormDevtoolsNode | undefined>(() => {
    const current = options.node.value
    if (!formContext || !current)
      return undefined

    return {
      component: resolveComponentName(current.component),
      formId: formContext.formId,
      id: nodeId,
      kind: 'component',
      order: nodeOrder,
      parentId,
      slotName: options.slotName.value,
      source: current.__source,
    }
  })

  useDevtoolsNodeRegistration({
    node,
    nodeId,
    rootRef: options.rootRef,
  })
}

function useDevtoolsNodeRegistration(options: {
  node: ComputedRef<FormDevtoolsNode | undefined>
  nodeId: string
  rootRef: Ref<unknown>
}) {
  const mountedStartedAt = now()
  let updateStartedAt = 0
  let registered = false
  let removeReadyListener: (() => void) | undefined
  const pendingPatchMetrics: FormFieldPatchMetric[] = []

  function element() {
    return resolveElement(options.rootRef.value)
  }

  function registerCurrent(bridge: FormDevtoolsBridge) {
    const current = options.node.value
    if (!current)
      return

    bridge.registerField(current, element())
    registered = true
  }

  function flushPendingPatches(bridge: FormDevtoolsBridge) {
    while (pendingPatchMetrics.length > 0) {
      const metric = pendingPatchMetrics.shift()
      if (metric)
        bridge.recordPatch(metric)
    }
  }

  function ensureReadyListener() {
    if (!isDevtoolsEnabled() || typeof window === 'undefined' || removeReadyListener)
      return

    const onReady = () => {
      removeReadyListener = undefined
      const readyBridge = getBridge()
      if (!readyBridge)
        return

      registerCurrent(readyBridge)
      flushPendingPatches(readyBridge)
    }

    window.addEventListener(devtoolsReadyEvent, onReady, { once: true })
    removeReadyListener = () => window.removeEventListener(devtoolsReadyEvent, onReady)
  }

  function registerOrWait() {
    if (!options.node.value)
      return

    const bridge = getBridge()
    if (bridge) {
      registerCurrent(bridge)
      return
    }

    ensureReadyListener()
  }

  function dispatchPatch(metric: FormFieldPatchMetric) {
    const bridge = getBridge()
    if (bridge) {
      if (!registered)
        registerCurrent(bridge)

      bridge.recordPatch(metric)
      return
    }

    if (!isDevtoolsEnabled())
      return

    pendingPatchMetrics.push(metric)
    ensureReadyListener()
  }

  function recordCurrentPatch(duration: number) {
    const current = options.node.value
    if (!current)
      return

    dispatchPatch({
      duration: Math.max(0, duration),
      id: current.id,
      timestamp: Date.now(),
    })
  }

  onMounted(() => {
    registerOrWait()
    recordCurrentPatch(now() - mountedStartedAt)
  })

  onBeforeUpdate(() => {
    updateStartedAt = performance.now()
  })

  onUpdated(() => {
    const current = options.node.value
    if (!current)
      return

    const bridge = getBridge()
    if (bridge) {
      if (registered)
        bridge.updateField(current, element())
      else
        registerCurrent(bridge)
    }
    else {
      registerOrWait()
    }

    if (updateStartedAt > 0) {
      recordCurrentPatch(now() - updateStartedAt)
      updateStartedAt = 0
    }
  })

  onBeforeUnmount(() => {
    removeReadyListener?.()

    if (registered)
      getBridge()?.unregisterField(options.nodeId)
  })
}
