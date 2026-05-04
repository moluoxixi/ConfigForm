import type { Component } from 'vue'
import type { FieldSourceMeta, FormDevtoolsBridge, FormDevtoolsNode, FormNodeRenderPhase } from './types'
import { computed, defineComponent, h, isVNode, nextTick, onMounted, onUnmounted, onUpdated, ref, useAttrs } from 'vue'

interface DevtoolsFieldConfig {
  component: unknown
  field: string
  label?: unknown
  __source?: FieldSourceMeta
}

interface DevtoolsFormNodeConfig {
  component?: unknown
  field?: unknown
  label?: unknown
  props?: Record<string, unknown>
  slots?: Record<string, unknown>
  __source?: FieldSourceMeta
}

export interface DevtoolsConfigFormAdapterOptions {
  /** 开发服务中要包裹的核心 ConfigForm 组件。 */
  ConfigForm: Component
  /** 核心字段收集器，用来保持真实字段与容器节点语义一致。 */
  collectFieldConfigs: (nodes: readonly unknown[]) => DevtoolsFieldConfig[]
}

type ExposedConfigForm = Record<string, unknown>
type VNodeLifecycleHook = (...args: unknown[]) => void

declare global {
  interface Window {
    __CONFIG_FORM_DEVTOOLS_BRIDGE__?: FormDevtoolsBridge
  }
}

const READY_EVENT = 'config-form-devtools:ready'
const SOURCE_ID_ATTRIBUTE = 'data-cf-devtools-source-id'
const EXPOSED_METHODS = [
  'submit',
  'validate',
  'validateField',
  'reset',
  'setValue',
  'setValues',
  'getValue',
  'getValues',
  'clearValidate',
] as const

let formSeed = 0

function now(): number {
  return typeof performance === 'undefined' ? Date.now() : performance.now()
}

function sanitizeFieldName(field: string): string {
  return field.replace(/[^\w-]/g, '-')
}

function escapeAttributeValue(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

function getBridge(): FormDevtoolsBridge | undefined {
  if (typeof window === 'undefined')
    return undefined
  return window.__CONFIG_FORM_DEVTOOLS_BRIDGE__
}

function resolveSourceElementArea(element: HTMLElement): number {
  const rect = element.getBoundingClientRect()
  return rect.width * rect.height
}

function selectBestSourceElement(candidates: HTMLElement[]): HTMLElement | null {
  if (candidates.length === 0)
    return null

  const visibleCandidates = candidates
    .map(element => ({
      area: resolveSourceElementArea(element),
      element,
    }))
    .filter(candidate => candidate.area > 0)
    .sort((a, b) => b.area - a.area)

  return visibleCandidates[0]?.element ?? candidates[0]
}

function querySourceElements(root: ParentNode, sourceId: string): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>(
    `[${SOURCE_ID_ATTRIBUTE}="${escapeAttributeValue(sourceId)}"]`,
  )]
}

function resolveSourceElement(source: FieldSourceMeta | undefined, root: ParentNode | null): HTMLElement | null {
  if (typeof document === 'undefined' || !source)
    return null

  const scopedElement = root ? selectBestSourceElement(querySourceElements(root, source.id)) : null
  if (scopedElement)
    return scopedElement

  return selectBestSourceElement(querySourceElements(document, source.id))
}

function resolveElement(namespace: string, node: FormDevtoolsNode, root: ParentNode | null): HTMLElement | null {
  if (typeof document === 'undefined')
    return null

  const sourceElement = resolveSourceElement(node.source, root)
  if (sourceElement)
    return sourceElement

  if (!node.field)
    return null

  return document.getElementById(`${namespace}-${sanitizeFieldName(node.field)}-field`)
}

function resolveComponentName(component: unknown): string | undefined {
  if (typeof component === 'string')
    return component
  if (typeof component === 'function')
    return component.name || undefined
  if (!component || typeof component !== 'object')
    return undefined

  const record = component as Record<string, unknown>
  if (typeof record.name === 'string')
    return record.name
  if (typeof record.__name === 'string')
    return record.__name
  return undefined
}

function resolveLabel(label: unknown): string | undefined {
  return typeof label === 'string' ? label : undefined
}

function resolveDevtoolsSourceId(node: DevtoolsFormNodeConfig): string | undefined {
  const id = node.__source?.id
  return typeof id === 'string' && id.length > 0 ? id : undefined
}

function normalizeTextContent(value: string | null | undefined): string | undefined {
  const text = value?.replace(/\s+/g, ' ').trim()
  return text && text.length > 0 ? text : undefined
}

function resolveLabelledByText(labelledBy: string | null): string | undefined {
  if (typeof document === 'undefined' || !labelledBy)
    return undefined

  for (const id of labelledBy.split(/\s+/)) {
    const text = normalizeTextContent(document.getElementById(id)?.textContent)
    if (text)
      return text
  }

  return undefined
}

function resolveTabPanel(host: HTMLElement | null): HTMLElement | null {
  return host?.closest<HTMLElement>('[role="tabpanel"]') ?? null
}

/**
 * 为多表单导航解析可读表单标签。
 *
 * 显式 data-cf-devtools-form-label 优先；tabpanel 的 aria 元数据只作为布局容器的标签来源。
 */
function resolveFormLabel(host: HTMLElement | null): string | undefined {
  if (!host)
    return undefined

  const explicitLabelHost = host.closest<HTMLElement>('[data-cf-devtools-form-label]')
  const explicitLabel = normalizeTextContent(explicitLabelHost?.dataset.cfDevtoolsFormLabel)
  if (explicitLabel)
    return explicitLabel

  const tabPanel = resolveTabPanel(host)
  return normalizeTextContent(tabPanel?.getAttribute('aria-label'))
    ?? resolveLabelledByText(tabPanel?.getAttribute('aria-labelledby') ?? null)
}

function isFormNodeConfig(value: unknown): value is DevtoolsFormNodeConfig {
  return Boolean(
    value
    && typeof value === 'object'
    && !Array.isArray(value)
    && !isVNode(value)
    && 'component' in value,
  )
}

function isFieldNodeConfig(value: DevtoolsFormNodeConfig): value is DevtoolsFormNodeConfig & { field: string } {
  return typeof value.field === 'string'
}

function resolveSlotContent(slot: unknown): unknown {
  return typeof slot === 'function' ? (slot as (scope?: Record<string, unknown>) => unknown)(undefined) : slot
}

/**
 * 克隆节点配置并保留原型和不可枚举属性，避免丢失 defineField/runtime brand。
 */
function cloneFormNodeConfig<TNode extends DevtoolsFormNodeConfig>(node: TNode): TNode {
  const clone = Object.create(Object.getPrototypeOf(node)) as TNode
  Object.defineProperties(clone, Object.getOwnPropertyDescriptors(node))
  return clone
}

function callVNodeHook(hook: unknown, args: unknown[]) {
  if (Array.isArray(hook)) {
    for (const item of hook)
      callVNodeHook(item, args)
    return
  }

  if (typeof hook === 'function')
    (hook as VNodeLifecycleHook)(...args)
}

/**
 * 合并 adapter 注入的 vnode 生命周期 hook 与用户已有 hook。
 *
 * 采集开始点放在用户 hook 后，结束点放在用户 hook 前，避免把用户 hook 执行时间算进渲染耗时。
 */
function mergeVNodeHook(
  existing: unknown,
  injected: VNodeLifecycleHook,
  order: 'before-existing' | 'after-existing',
): VNodeLifecycleHook {
  if (!existing)
    return injected

  return (...args: unknown[]) => {
    if (order === 'before-existing')
      injected(...args)

    callVNodeHook(existing, args)

    if (order === 'after-existing')
      injected(...args)
  }
}

/**
 * 包裹 ConfigForm 并注册 devtools，同时保留核心组件暴露的 ref API。
 *
 * adapter 会收集声明式节点树、映射真实 DOM、代理内部 ConfigForm 方法，
 * 并在 mount/update/unmount 阶段同步浏览器 bridge。
 */
export function createDevtoolsConfigFormAdapter(options: DevtoolsConfigFormAdapterOptions): Component {
  return defineComponent({
    inheritAttrs: false,
    name: 'ConfigFormDevtoolsAdapter',
    props: {
      fields: { type: Array, required: true },
      namespace: { type: String, default: 'cf' },
    },
    setup(props, { expose, slots }) {
      const attrs = useAttrs()
      const formId = `cf-form-${++formSeed}`
      const coreRef = ref<ExposedConfigForm | null>(null)
      const hostRef = ref<HTMLElement | null>(null)
      const registeredIds = new Set<string>()
      const renderStarts = new Map<string, number>()
      let syncQueued = false

      function startRenderTiming(id: string) {
        renderStarts.set(id, now())
      }

      function finishRenderTiming(id: string, phase: FormNodeRenderPhase) {
        const start = renderStarts.get(id)
        if (start === undefined)
          return

        renderStarts.delete(id)
        const end = now()
        getBridge()?.recordRender({
          duration: Math.max(0, end - start),
          id,
          phase,
          timestamp: now(),
        })
      }

      function withRenderTimingProps(id: string, props: Record<string, unknown> | undefined): Record<string, unknown> {
        const next = { ...(props ?? {}) }

        next.onVnodeBeforeMount = mergeVNodeHook(
          props?.onVnodeBeforeMount,
          () => startRenderTiming(id),
          'after-existing',
        )
        next.onVnodeMounted = mergeVNodeHook(
          props?.onVnodeMounted,
          () => finishRenderTiming(id, 'mount'),
          'before-existing',
        )
        next.onVnodeBeforeUpdate = mergeVNodeHook(
          props?.onVnodeBeforeUpdate,
          () => startRenderTiming(id),
          'after-existing',
        )
        next.onVnodeUpdated = mergeVNodeHook(
          props?.onVnodeUpdated,
          () => finishRenderTiming(id, 'update'),
          'before-existing',
        )

        return next
      }

      function withDevtoolsSourceProps(
        node: DevtoolsFormNodeConfig,
        props: Record<string, unknown>,
      ): Record<string, unknown> {
        const sourceId = resolveDevtoolsSourceId(node)
        if (!sourceId)
          return props

        const existing = props[SOURCE_ID_ATTRIBUTE]
        if (existing !== undefined && existing !== sourceId) {
          throw new Error(
            `Conflicting ${SOURCE_ID_ATTRIBUTE}: expected ${sourceId}, received ${String(existing)}`,
          )
        }

        return {
          ...props,
          [SOURCE_ID_ATTRIBUTE]: sourceId,
        }
      }

      function withDevtoolsNodeProps(id: string, node: DevtoolsFormNodeConfig): Record<string, unknown> {
        return withDevtoolsSourceProps(node, withRenderTimingProps(id, node.props))
      }

      function callExposed(methodName: string, args: unknown[]) {
        const method = coreRef.value?.[methodName]
        if (typeof method !== 'function')
          throw new Error(`ConfigForm method "${methodName}" is not available before the wrapped form is mounted`)
        return method(...args)
      }

      expose(Object.fromEntries(EXPOSED_METHODS.map(methodName => [
        methodName,
        (...args: unknown[]) => callExposed(methodName, args),
      ])))

      function collectNodeTree(
        nodes: readonly unknown[],
        formLabel: string | undefined,
        parentId: string | undefined,
        path: string,
        slotName?: string,
      ): FormDevtoolsNode[] {
        // devtools 树必须按用户声明顺序展示，不能依赖 slot 子节点可能变化的 Vue 挂载时序。
        return nodes.flatMap((node, index) => {
          if (!isFormNodeConfig(node))
            return []

          const nodePath = `${path}.${index}`
          const isField = isFieldNodeConfig(node)
          const id = isField ? `${formId}:${node.field}` : `${formId}:${nodePath}`
          const current: FormDevtoolsNode = {
            component: resolveComponentName(node.component),
            field: isField ? node.field : undefined,
            formId,
            formLabel,
            id,
            kind: isField ? 'field' : 'component',
            label: resolveLabel(node.label),
            order: index + 1,
            parentId,
            slotName,
            source: node.__source,
          }

          const children = Object.entries(node.slots ?? {}).flatMap(([childSlotName, slot]) => {
            const content = resolveSlotContent(slot)
            const childNodes = Array.isArray(content) ? content : [content]
            return collectNodeTree(childNodes, formLabel, id, `${nodePath}.slots.${childSlotName}`, childSlotName)
          })

          return [current, ...children]
        })
      }

      /**
       * 给声明式节点树注入 vnode 生命周期计时 props。
       *
       * 这里返回克隆节点，避免为了 devtools 采集修改用户传入的字段配置对象。
       */
      function instrumentNode(
        node: unknown,
        path: string,
        index: number,
      ): unknown {
        if (!isFormNodeConfig(node))
          return node

        const nodePath = `${path}.${index}`
        const id = isFieldNodeConfig(node) ? `${formId}:${node.field}` : `${formId}:${nodePath}`
        const next = cloneFormNodeConfig(node)
        next.props = withDevtoolsNodeProps(id, node)

        if (node.slots) {
          next.slots = Object.fromEntries(
            Object.entries(node.slots).map(([slotName, slot]) => [
              slotName,
              instrumentSlot(slot, `${nodePath}.slots.${slotName}`),
            ]),
          )
        }

        return next
      }

      function instrumentNodeTree(nodes: readonly unknown[], path: string): unknown[] {
        return nodes.map((node, index) => instrumentNode(node, path, index))
      }

      function instrumentSlotContent(content: unknown, path: string): unknown {
        if (Array.isArray(content))
          return content.map((node, index) => instrumentNode(node, path, index))

        return instrumentNode(content, path, 0)
      }

      function instrumentSlot(slot: unknown, path: string): unknown {
        if (typeof slot !== 'function')
          return instrumentSlotContent(slot, path)

        return function instrumentedSlot(this: unknown, scope?: Record<string, unknown>) {
          return instrumentSlotContent(
            (slot as (this: unknown, scope?: Record<string, unknown>) => unknown).call(this, scope),
            path,
          )
        }
      }

      function collectNodes(): FormDevtoolsNode[] {
        return collectNodeTree(props.fields, resolveFormLabel(hostRef.value), undefined, 'fields')
      }

      const instrumentedFields = computed(() => instrumentNodeTree(props.fields, 'fields'))

      function syncBridge() {
        const bridge = getBridge()
        if (!bridge)
          return

        // 每次同步都按完整快照注册/更新，便于 client 删除字段或 slot 树变化后的过期 id。
        const nodes = collectNodes()
        const nextIds = new Set(nodes.map(node => node.id))

        for (const id of registeredIds) {
          if (!nextIds.has(id)) {
            bridge.unregisterField(id)
            registeredIds.delete(id)
          }
        }

        for (const node of nodes) {
          const syncStart = now()
          const element = resolveElement(props.namespace, node, hostRef.value)
          const action = registeredIds.has(node.id) ? bridge.updateField : bridge.registerField
          action(node, element)
          registeredIds.add(node.id)
          bridge.recordSync({
            duration: Math.max(0, now() - syncStart),
            id: node.id,
            timestamp: now(),
          })
        }
      }

      function queueSyncBridge() {
        if (syncQueued)
          return

        // mount/update/ready 可能在同一轮事件里连续触发；bridge 只需要同步最新字段快照。
        syncQueued = true
        void nextTick().then(() => {
          syncQueued = false
          syncBridge()
        })
      }

      function unregisterNodes() {
        const bridge = getBridge()
        if (!bridge)
          return

        for (const id of registeredIds)
          bridge.unregisterField(id)
        registeredIds.clear()
      }

      onMounted(() => {
        if (typeof window !== 'undefined')
          window.addEventListener(READY_EVENT, queueSyncBridge)
        queueSyncBridge()
      })

      onUpdated(queueSyncBridge)

      onUnmounted(() => {
        if (typeof window !== 'undefined')
          window.removeEventListener(READY_EVENT, queueSyncBridge)
        unregisterNodes()
      })

      return () => h('div', { ref: hostRef, style: { display: 'contents' } }, [
        h(options.ConfigForm, {
          ...attrs,
          fields: instrumentedFields.value,
          namespace: props.namespace,
          ref: coreRef,
        }, slots),
      ])
    },
  })
}
