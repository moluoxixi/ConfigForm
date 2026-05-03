import type { Component } from 'vue'
import type { FieldSourceMeta, FormDevtoolsBridge, FormDevtoolsNode } from './types'
import { defineComponent, h, nextTick, onMounted, onUnmounted, onUpdated, ref, useAttrs } from 'vue'

interface DevtoolsFieldConfig {
  component: unknown
  field: string
  label?: unknown
  __source?: FieldSourceMeta
}

export interface DevtoolsConfigFormAdapterOptions {
  ConfigForm: Component
  collectFieldConfigs: (nodes: readonly unknown[]) => DevtoolsFieldConfig[]
}

type ExposedConfigForm = Record<string, unknown>

interface AdapterFieldNode extends FormDevtoolsNode {
  field: string
}

declare global {
  interface Window {
    __CONFIG_FORM_DEVTOOLS_BRIDGE__?: FormDevtoolsBridge
  }
}

const READY_EVENT = 'config-form-devtools:ready'
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

function getBridge(): FormDevtoolsBridge | undefined {
  if (typeof window === 'undefined')
    return undefined
  return window.__CONFIG_FORM_DEVTOOLS_BRIDGE__
}

function resolveElement(namespace: string, field: string): HTMLElement | null {
  if (typeof document === 'undefined')
    return null
  return document.getElementById(`${namespace}-${sanitizeFieldName(field)}-field`)
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

      function collectNodes(): AdapterFieldNode[] {
        return options.collectFieldConfigs(props.fields).map((field, index) => ({
          component: resolveComponentName(field.component),
          field: field.field,
          formId,
          id: `${formId}:${field.field}`,
          kind: 'field',
          label: resolveLabel(field.label),
          order: index + 1,
          source: field.__source,
        }))
      }

      function syncBridge() {
        const bridge = getBridge()
        if (!bridge)
          return

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
          const element = resolveElement(props.namespace, node.field)
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

      return () => h(options.ConfigForm, {
        ...attrs,
        fields: props.fields,
        namespace: props.namespace,
        ref: coreRef,
      }, slots)
    },
  })
}
