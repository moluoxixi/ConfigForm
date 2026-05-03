import type { Component } from 'vue'
import type { FieldSourceMeta, FormDevtoolsBridge, FormDevtoolsNode } from './types'
import { defineComponent, h, isVNode, nextTick, onMounted, onUnmounted, onUpdated, ref, useAttrs } from 'vue'

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
  slots?: Record<string, unknown>
  __source?: FieldSourceMeta
}

export interface DevtoolsConfigFormAdapterOptions {
  /** Core ConfigForm component to wrap in dev server mode. */
  ConfigForm: Component
  /** Core field collector used to preserve real field semantics. */
  collectFieldConfigs: (nodes: readonly unknown[]) => DevtoolsFieldConfig[]
}

type ExposedConfigForm = Record<string, unknown>

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
 * Resolve a human-readable form label for multi-form navigation.
 *
 * Explicit data-cf-devtools-form-label wins; tabpanel aria metadata is only a
 * fallback so generic containers and non-tab layouts can still label a form.
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
 * Wrap ConfigForm with devtools registration while preserving the core exposed API.
 *
 * The adapter collects the declared node tree, maps nodes to rendered DOM
 * elements, forwards ref methods to the inner ConfigForm, and keeps the browser
 * bridge synchronized across mount/update/unmount.
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
        // Keep the devtools tree aligned with user-declared order instead of
        // relying on Vue mount timing, which can change for slot children.
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

      function collectNodes(): FormDevtoolsNode[] {
        return collectNodeTree(props.fields, resolveFormLabel(hostRef.value), undefined, 'fields')
      }

      function syncBridge() {
        const bridge = getBridge()
        if (!bridge)
          return

        // Register/update all nodes as one snapshot so the client can drop
        // stale ids when fields or slot trees change.
        const start = now()
        const nodes = collectNodes()
        const nextIds = new Set(nodes.map(node => node.id))

        for (const id of registeredIds) {
          if (!nextIds.has(id)) {
            bridge.unregisterField(id)
            registeredIds.delete(id)
          }
        }

        for (const node of nodes) {
          const element = resolveElement(props.namespace, node, hostRef.value)
          const action = registeredIds.has(node.id) ? bridge.updateField : bridge.registerField
          action(node, element)
          registeredIds.add(node.id)
          bridge.recordPatch({
            duration: Math.max(0, now() - start),
            id: node.id,
            timestamp: now(),
          })
        }
      }

      function queueSyncBridge() {
        void nextTick().then(syncBridge)
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
          fields: props.fields,
          namespace: props.namespace,
          ref: coreRef,
        }, slots),
      ])
    },
  })
}
