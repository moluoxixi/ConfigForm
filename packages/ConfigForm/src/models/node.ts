import type { DefinedFormNodeConfig, FieldConfig, FormNodeConfig, SlotContent } from '@/types'
import { isVNode } from 'vue'
import { CONFIG_FORM_DEFINED_NODE } from '@/types'

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

export function markDefinedFormNodeConfig<TConfig extends FormNodeConfig>(
  value: TConfig,
): DefinedFormNodeConfig<TConfig> {
  Object.defineProperty(value, CONFIG_FORM_DEFINED_NODE, {
    configurable: false,
    enumerable: false,
    value: true,
    writable: false,
  })

  return value as DefinedFormNodeConfig<TConfig>
}

export function isDefinedFormNodeConfig(value: unknown): value is DefinedFormNodeConfig {
  return Boolean(
    isFormNodeConfig(value)
    && (value as { [CONFIG_FORM_DEFINED_NODE]?: unknown })[CONFIG_FORM_DEFINED_NODE] === true,
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

export function assertDefinedSlotNodeConfig(value: FormNodeConfig, path = 'slot node') {
  if (!isDefinedFormNodeConfig(value))
    throw new Error(`Slot node config at ${path} must be created with defineField(...)`)
}

function collectSlotFields(slot: SlotContent | undefined, path = 'slot'): FieldConfig[] {
  if (slot == null || slot === false)
    return []

  if (typeof slot === 'function')
    return []

  if (Array.isArray(slot))
    return slot.flatMap((item, index) => collectSlotFields(item as SlotContent, `${path}.${index}`))

  if (!isFormNodeConfig(slot))
    return []

  assertDefinedSlotNodeConfig(slot, path)
  return collectFieldConfigs([slot])
}

export function collectFieldConfigs(nodes: readonly FormNodeConfig[]): FieldConfig[] {
  return nodes.flatMap((node) => {
    assertComponentNodeConfig(node)

    const nested = Object.entries(node.slots ?? {}).flatMap(([key, slot]) => collectSlotFields(slot, `${nodePath(node)}.slots.${key}`))
    return isFieldConfig(node) ? [node, ...nested] : nested
  })
}

function nodePath(node: FormNodeConfig): string {
  return isFieldConfig(node) ? node.field : 'component node'
}
