import type {
  DefinedFormNodeConfig,
  FieldConfig,
  FormNodeConfig,
  ResolvedField,
  ResolvedFormNode,
  SlotContent,
} from '@/types'
import { isVNode } from 'vue'
import { CONFIG_FORM_DEFINED_NODE } from '@/types'

const CONFIG_FORM_RESOLVED_NODE = Symbol.for('moluoxixi.config-form.resolved-node')

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

function assertNoLegacyNodePlugins(value: FormNodeConfig, path: string): void {
  if (Object.hasOwn(value, 'plugins'))
    throw new Error(`${path}.plugins is no longer supported. Use runtime plugins and runtime tokens instead.`)
}

/** Return whether an unknown value looks like a ConfigForm node declaration. */
export function isFormNodeConfig(value: unknown): value is FormNodeConfig {
  return Boolean(
    isRecord(value)
    && !isVNode(value)
    && 'component' in value,
  )
}

/** Return whether a node declaration is a real field node with a bound value key. */
export function isFieldConfig(value: unknown): value is FieldConfig {
  return Boolean(
    isFormNodeConfig(value)
    && typeof (value as { field?: unknown }).field === 'string',
  )
}

/** Attach the non-enumerable defineField(...) brand to a node config. */
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

/** Return whether a node config was created by defineField(...). */
export function isDefinedFormNodeConfig(value: unknown): value is DefinedFormNodeConfig {
  return Boolean(
    isFormNodeConfig(value)
    && (value as { [CONFIG_FORM_DEFINED_NODE]?: unknown })[CONFIG_FORM_DEFINED_NODE] === true,
  )
}

/** Attach both defineField and resolved-node brands to a runtime-resolved node. */
export function markResolvedFormNodeConfig<TConfig extends ResolvedFormNode>(
  value: TConfig,
): TConfig {
  const defined = markDefinedFormNodeConfig(value as TConfig & FormNodeConfig)

  if ((defined as unknown as Record<symbol, unknown>)[CONFIG_FORM_RESOLVED_NODE] !== true) {
    Object.defineProperty(defined, CONFIG_FORM_RESOLVED_NODE, {
      configurable: false,
      enumerable: false,
      value: true,
      writable: false,
    })
  }

  return defined as TConfig
}

/** Return whether a node has already been resolved by FormRuntime. */
export function isResolvedFormNodeConfig(value: unknown): value is ResolvedFormNode {
  return Boolean(
    isFormNodeConfig(value)
    && (value as unknown as Record<symbol, unknown>)[CONFIG_FORM_RESOLVED_NODE] === true,
  )
}

/** Return whether a resolved node is also a field node. */
export function isResolvedFieldConfig(value: unknown): value is ResolvedField {
  return isResolvedFormNodeConfig(value) && isFieldConfig(value)
}

/**
 * Validate node-level invariants.
 *
 * A node with `field` is a real form field; a node without `field` is a
 * container and must not use field-only options such as label or schema.
 */
export function assertComponentNodeConfig(value: FormNodeConfig, path = 'component node') {
  if (isFieldConfig(value)) {
    assertNoLegacyNodePlugins(value, 'field')
    return
  }

  assertNoLegacyNodePlugins(value, path)

  for (const key of FIELD_ONLY_NODE_KEYS) {
    if (key in value)
      throw new Error(`Component node without field cannot use field-only option "${key}" at ${path}`)
  }
}

/** Enforce defineField(...) usage for object node configs returned from slots. */
export function assertDefinedSlotNodeConfig(value: FormNodeConfig, path = 'slot node') {
  if (!isDefinedFormNodeConfig(value))
    throw new Error(`Slot node config at ${path} must be created with defineField(...)`)
}

function collectSlotFields(slot: SlotContent | undefined, path = 'slot'): FieldConfig[] {
  if (slot == null || slot === false)
    return []

  if (typeof slot === 'function') {
    const resolved = slot(undefined)
    return typeof resolved === 'function'
      ? []
      : collectSlotFields(resolved, path)
  }

  if (Array.isArray(slot))
    return slot.flatMap((item, index) => collectSlotFields(item as SlotContent, `${path}.${index}`))

  if (!isFormNodeConfig(slot))
    return []

  assertDefinedSlotNodeConfig(slot, path)
  return collectFieldConfigsRaw([slot])
}

function collectFieldConfigsRaw(nodes: readonly FormNodeConfig[]): FieldConfig[] {
  return nodes.flatMap((node) => {
    assertComponentNodeConfig(node)

    const nested = Object.entries(node.slots ?? {}).flatMap(([key, slot]) => collectSlotFields(slot, `${nodePath(node)}.slots.${key}`))
    return isFieldConfig(node) ? [node, ...nested] : nested
  })
}

/** Throw when multiple collected real fields bind the same form value key. */
export function assertUniqueFieldConfigs<TField extends Pick<FieldConfig, 'field'>>(
  fields: readonly TField[],
): TField[] {
  const seen = new Set<string>()

  for (const field of fields) {
    if (seen.has(field.field))
      throw new Error(`Duplicate field key: ${field.field}`)

    seen.add(field.field)
  }

  return [...fields]
}

/**
 * Collect real field configs from a mixed node tree, including slot children.
 *
 * Container nodes are traversed but are not returned because they do not own
 * values, validation, or submit behavior.
 */
export function collectFieldConfigs(nodes: readonly FormNodeConfig[]): FieldConfig[] {
  return assertUniqueFieldConfigs(collectFieldConfigsRaw(nodes))
}

function nodePath(node: FormNodeConfig): string {
  return isFieldConfig(node) ? node.field : 'component node'
}
