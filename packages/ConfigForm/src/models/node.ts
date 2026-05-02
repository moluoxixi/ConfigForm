import type { FieldConfig, FormNodeConfig, SlotContent } from '@/types'
import { isVNode } from 'vue'

const FIELD_ONLY_NODE_KEYS = [
  'blurTrigger',
  'defaultValue',
  'disabled',
  'label',
  'schema',
  'span',
  'submitWhenDisabled',
  'submitWhenHidden',
  'transform',
  'trigger',
  'validateOn',
  'validator',
  'valueProp',
  'visible',
] as const

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

export function isFormNodeConfig(value: unknown): value is FormNodeConfig {
  return Boolean(
    isRecord(value)
    && !isVNode(value)
    && 'component' in value,
  )
}

export function isFieldConfig(value: unknown): value is FieldConfig {
  return Boolean(
    isFormNodeConfig(value)
    && typeof (value as { field?: unknown }).field === 'string',
  )
}

export function assertComponentNodeConfig(value: FormNodeConfig, path = 'component node') {
  if (isFieldConfig(value))
    return

  for (const key of FIELD_ONLY_NODE_KEYS) {
    if (key in value)
      throw new Error(`Component node without field cannot use field-only option "${key}" at ${path}`)
  }
}

function collectSlotFields(slot: SlotContent | undefined): FieldConfig[] {
  if (slot == null || slot === false)
    return []

  if (typeof slot === 'function')
    return []

  if (Array.isArray(slot))
    return slot.flatMap(item => collectSlotFields(item as SlotContent))

  if (!isFormNodeConfig(slot))
    return []

  return collectFieldConfigs([slot])
}

export function collectFieldConfigs(nodes: readonly FormNodeConfig[]): FieldConfig[] {
  return nodes.flatMap((node) => {
    assertComponentNodeConfig(node)

    const nested = Object.values(node.slots ?? {}).flatMap(slot => collectSlotFields(slot))
    return isFieldConfig(node) ? [node, ...nested] : nested
  })
}
