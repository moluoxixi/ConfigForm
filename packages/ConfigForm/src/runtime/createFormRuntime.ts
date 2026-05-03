import type {
  ComponentRegistry,
  CreateRuntimeResolveSnapInput,
  FormFieldTransform,
  FormRuntime,
  FormRuntimeHookOrder,
  FormRuntimeObjectHook,
  FormRuntimeOptions,
  FormRuntimePlugin,
  FormRuntimeResolveSnap,
  FormRuntimeTokenResolver,
} from './types'
import type {
  FieldCondition,
  FieldConfig,
  FormNodeConfig,
  FormValues,
  NormalizedFieldConfig,
  ResolvedComponentNode,
  ResolvedField,
  ResolvedFormNode,
  RuntimeToken,
  SlotContent,
} from '@/types'
import { isVNode } from 'vue'
import { normalizeField } from '@/models/field'
import {
  assertComponentNodeConfig,
  assertDefinedSlotNodeConfig,
  isFieldConfig,
  isFormNodeConfig,
  isResolvedFieldConfig,
  isResolvedFormNodeConfig,
  markResolvedFormNodeConfig,
} from '@/models/node'

const CONFIG_FORM_TRANSFORMED_FIELD = Symbol('moluoxixi.config-form.transformed-field')
const RUNTIME_TOKEN_RESERVED_KEYS = ['__configFormToken', '__configFormValue'] as const

interface RuntimeHook<THandler extends (...args: never[]) => unknown> {
  handler: THandler
  order?: FormRuntimeHookOrder
  pluginName: string
}

/** 创建一个运行时 token，后续由同 type 的 token resolver 解析成真实值。 */
export function createRuntimeToken<TValue = unknown, TType extends string = string>(
  type: TType,
): RuntimeToken<TValue, TType>
/** 创建一个带 payload 的运行时 token；payload 会原样传给 token resolver。 */
export function createRuntimeToken<
  TValue = unknown,
  TType extends string = string,
  TPayload extends Record<string, unknown> = Record<string, unknown>,
>(
  type: TType,
  payload: TPayload,
): RuntimeToken<TValue, TType> & TPayload
export function createRuntimeToken<TValue = unknown, TType extends string = string>(
  type: TType,
  payload: Record<string, unknown> = {},
): RuntimeToken<TValue, TType> & Record<string, unknown> {
  for (const key of RUNTIME_TOKEN_RESERVED_KEYS) {
    if (Object.hasOwn(payload, key))
      throw new TypeError(`Payload cannot contain reserved runtime token key: ${key}`)
  }

  return {
    __configFormToken: type,
    ...payload,
  } as RuntimeToken<TValue, TType> & Record<string, unknown>
}

/** 判断未知值是否是 runtime token。 */
export function isRuntimeToken<TValue = unknown>(value: unknown): value is RuntimeToken<TValue> {
  return Boolean(
    value
    && typeof value === 'object'
    && typeof (value as { __configFormToken?: unknown }).__configFormToken === 'string',
  )
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    return false
  const proto = Object.getPrototypeOf(value)
  return proto === Object.prototype || proto === null
}

function isComponentLikeRecord(value: Record<string, unknown>): boolean {
  return Boolean(
    value.__v_skip
    || value.setup
    || value.render
    || value.template
    || value.__vccOpts,
  )
}

function isTransformedFieldConfig(value: unknown): value is NormalizedFieldConfig {
  return Boolean(
    value
    && typeof value === 'object'
    && (value as Record<symbol, unknown>)[CONFIG_FORM_TRANSFORMED_FIELD] === true,
  )
}

function markTransformedFieldConfig<TField extends NormalizedFieldConfig>(field: TField): TField {
  Object.defineProperty(field, CONFIG_FORM_TRANSFORMED_FIELD, {
    configurable: false,
    enumerable: false,
    value: true,
    writable: false,
  })

  return field
}

function cloneNormalizedField(field: NormalizedFieldConfig): NormalizedFieldConfig {
  return {
    ...field,
    props: { ...field.props },
    slots: field.slots ? { ...field.slots } : field.slots,
  }
}

function assertNoLegacyFieldPlugins(value: unknown, path: string): void {
  if (value && typeof value === 'object' && Object.hasOwn(value, 'plugins'))
    throw new Error(`${path}.plugins is no longer supported. Use runtime plugins and runtime tokens instead.`)
}

function normalizeObjectHook<THandler extends (...args: never[]) => unknown>(
  pluginName: string,
  hookName: string,
  hook: FormRuntimeObjectHook<THandler>,
): RuntimeHook<THandler> {
  if (typeof hook === 'function') {
    return {
      handler: hook,
      pluginName,
    }
  }

  if (!hook || typeof hook !== 'object' || typeof hook.handler !== 'function')
    throw new TypeError(`Plugin ${pluginName} hook ${hookName} must be a function or an object hook`)

  if (hook.order !== undefined && hook.order !== 'pre' && hook.order !== 'post')
    throw new TypeError(`Plugin ${pluginName} hook ${hookName}.order must be "pre" or "post"`)

  return {
    handler: hook.handler,
    order: hook.order,
    pluginName,
  }
}

function orderHooks<THandler extends (...args: never[]) => unknown>(
  hooks: RuntimeHook<THandler>[],
): RuntimeHook<THandler>[] {
  const pre = hooks.filter(hook => hook.order === 'pre')
  const normal = hooks.filter(hook => hook.order === undefined)
  const post = hooks.filter(hook => hook.order === 'post')
  return [...pre, ...normal, ...post]
}

function createSlotResolveSnap(
  resolveSnap: FormRuntimeResolveSnap,
  slotName: string,
): FormRuntimeResolveSnap & { slotName: string } {
  return {
    ...resolveSnap,
    slotName,
  }
}

/** 创建表单运行时实例，合并组件注册、插件 hook 和 token resolver。 */
export function createFormRuntime(options: FormRuntimeOptions = {}): FormRuntime {
  const plugins: FormRuntimePlugin[] = [...(options.plugins ?? [])]
  const components: ComponentRegistry = { ...(options.components ?? {}) }
  const tokenResolvers: Record<string, FormRuntimeTokenResolver> = {}
  const fieldTransformHooks: RuntimeHook<FormFieldTransform>[] = []

  const seenPluginNames = new Set<string>()
  for (const plugin of plugins) {
    if (seenPluginNames.has(plugin.name))
      throw new Error(`Duplicate plugin name: ${plugin.name}`)
    else
      seenPluginNames.add(plugin.name)

    for (const [key, component] of Object.entries(plugin.components ?? {})) {
      if (Object.hasOwn(components, key))
        throw new Error(`Component key conflict: ${key}`)
      components[key] = component
    }

    for (const [type, resolver] of Object.entries(plugin.tokens ?? {})) {
      if (Object.hasOwn(tokenResolvers, type))
        throw new Error(`Token resolver conflict: ${type}`)
      tokenResolvers[type] = resolver
    }

    if (plugin.transformField)
      fieldTransformHooks.push(normalizeObjectHook(plugin.name, 'transformField', plugin.transformField))
  }

  const orderedFieldTransformHooks = orderHooks(fieldTransformHooks)

  function createResolveSnap<TValues extends FormValues = FormValues>(
    input: CreateRuntimeResolveSnapInput<TValues> = {},
  ): FormRuntimeResolveSnap<TValues> {
    return {
      errors: input.errors ?? {},
      field: input.field,
      slotName: input.slotName,
      slotScope: input.slotScope,
      values: input.values ?? ({} as TValues),
    }
  }

  function resolveComponent(component: FieldConfig['component']): FieldConfig['component'] {
    if (typeof component === 'string' && Object.hasOwn(components, component))
      return components[component]
    if (typeof component === 'string' && /^[A-Z]/.test(component))
      throw new Error(`Unknown component key: ${component}`)
    return component
  }

  function resolveToken(value: RuntimeToken, resolveSnap: FormRuntimeResolveSnap, path: string): unknown {
    const resolver = tokenResolvers[value.__configFormToken]
    if (!resolver)
      throw new Error(`No token resolver registered for token type: ${value.__configFormToken}`)

    return resolver(value, resolveSnap, path, { resolveValue })
  }

  function resolveRecord(
    value: Record<string, unknown>,
    resolveSnap: FormRuntimeResolveSnap,
    path: string,
  ): Record<string, unknown> {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        resolveValue(item, resolveSnap, `${path}.${key}`),
      ]),
    )
  }

  function resolveValue<TValue = unknown>(
    value: TValue,
    resolveSnap: FormRuntimeResolveSnap,
    path = 'value',
  ): unknown {
    let resolved: unknown = value

    if (isRuntimeToken(resolved)) {
      resolved = resolveToken(resolved, resolveSnap, path)
    }
    else if (Array.isArray(resolved)) {
      resolved = resolved.map((item, index) => resolveValue(item, resolveSnap, `${path}.${index}`))
    }
    else if (isPlainRecord(resolved) && !isVNode(resolved) && !isComponentLikeRecord(resolved)) {
      resolved = resolveRecord(resolved, resolveSnap, path)
    }

    return resolved
  }

  function resolveComponentNodeBase(
    config: FormNodeConfig,
    resolveSnap: FormRuntimeResolveSnap,
    path: string,
  ): ResolvedComponentNode {
    assertComponentNodeConfig(config, path)

    return markResolvedFormNodeConfig({
      ...config,
      component: resolveComponent(config.component),
      props: resolveRecord(config.props ?? {}, resolveSnap, `${path}.props`),
      slots: config.slots
        ? Object.fromEntries(
            Object.entries(config.slots).map(([key, slot]) => [
              key,
              resolveSlot(slot, createSlotResolveSnap(resolveSnap, key), `${path}.slots.${key}`),
            ]),
          )
        : config.slots,
    })
  }

  function resolveNode(node: FormNodeConfig, resolveSnap: FormRuntimeResolveSnap, path = 'node'): ResolvedFormNode {
    if (isResolvedFormNodeConfig(node))
      return node

    if (isFieldConfig(node))
      return resolveField(node, resolveSnap)

    return resolveComponentNodeBase(node, resolveSnap, path)
  }

  function resolveSlotBase(slot: SlotContent, resolveSnap: FormRuntimeResolveSnap, path: string): SlotContent {
    if (typeof slot === 'function') {
      return (scope?: Record<string, unknown>) => resolveSlotBase(
        slot(scope),
        {
          ...resolveSnap,
          slotScope: scope,
        },
        path,
      )
    }

    if (Array.isArray(slot))
      return slot.map((item, index) => resolveSlotBase(item as SlotContent, resolveSnap, `${path}.${index}`)) as SlotContent

    if (isFormNodeConfig(slot)) {
      if (isResolvedFormNodeConfig(slot))
        return slot

      assertDefinedSlotNodeConfig(slot, path)
      return resolveNode(slot, resolveSnap, path) as SlotContent
    }

    return resolveValue(slot, resolveSnap, path) as SlotContent
  }

  function resolveSlot(slot: SlotContent, resolveSnap: FormRuntimeResolveSnap, path = 'slot'): SlotContent {
    return resolveSlotBase(slot, resolveSnap, path)
  }

  function resolveFieldBase(config: NormalizedFieldConfig, resolveSnap: FormRuntimeResolveSnap): ResolvedField {
    return markResolvedFormNodeConfig({
      ...config,
      component: resolveComponent(config.component),
      label: config.label == null
        ? config.label
        : String(resolveValue(config.label, resolveSnap, `${config.field}.label`)),
      props: resolveRecord(config.props, resolveSnap, `${config.field}.props`),
      slots: config.slots
        ? Object.fromEntries(
            Object.entries(config.slots).map(([key, slot]) => [
              key,
              resolveSlot(slot, createSlotResolveSnap(resolveSnap, key), `${config.field}.slots.${key}`),
            ]),
          )
        : config.slots,
    })
  }

  function transformField(
    field: FieldConfig | NormalizedFieldConfig,
  ): NormalizedFieldConfig {
    if (isResolvedFieldConfig(field) || isTransformedFieldConfig(field))
      return field

    assertNoLegacyFieldPlugins(field, 'field')

    let config = normalizeField(field)
    assertNoLegacyFieldPlugins(config, 'field')

    for (const hook of orderedFieldTransformHooks) {
      const hookField = cloneNormalizedField(config)
      const next = hook.handler(hookField)
      if (next === undefined)
        continue

      if (!next || typeof next !== 'object' || Array.isArray(next))
        throw new TypeError(`Plugin ${hook.pluginName} transformField must return a field object or undefined`)

      assertNoLegacyFieldPlugins(next, `plugin ${hook.pluginName} transformField result`)

      const normalized = normalizeField(next as FieldConfig)
      assertNoLegacyFieldPlugins(normalized, `plugin ${hook.pluginName} transformField result`)
      if (normalized.field !== config.field) {
        throw new Error(
          `Plugin ${hook.pluginName} transformField cannot change field key from "${config.field}" to "${normalized.field}"`,
        )
      }

      config = normalized
    }

    return markTransformedFieldConfig(config)
  }

  function resolveField(field: FieldConfig, resolveSnap: FormRuntimeResolveSnap): ResolvedField {
    if (isResolvedFieldConfig(field))
      return field

    const transformed = transformField(field)
    const fieldResolveSnap = { ...resolveSnap, field: transformed }
    return resolveFieldBase(transformed, fieldResolveSnap)
  }

  function resolveConditionBase(
    condition: FieldCondition<FormValues> | undefined,
    resolveSnap: FormRuntimeResolveSnap,
    fallback: boolean,
  ): boolean {
    if (condition == null)
      return fallback
    if (typeof condition === 'boolean')
      return condition
    if (isRuntimeToken<boolean>(condition))
      return Boolean(resolveValue(condition, resolveSnap, 'condition'))
    return condition(resolveSnap.values)
  }

  function resolveVisible(field: FieldConfig | NormalizedFieldConfig, resolveSnap: FormRuntimeResolveSnap): boolean {
    const transformed = transformField(field)
    const fieldResolveSnap = { ...resolveSnap, field: transformed }
    return resolveConditionBase(transformed.visible, fieldResolveSnap, true)
  }

  function resolveDisabled(field: FieldConfig | NormalizedFieldConfig, resolveSnap: FormRuntimeResolveSnap): boolean {
    const transformed = transformField(field)
    const fieldResolveSnap = { ...resolveSnap, field: transformed }
    return resolveConditionBase(transformed.disabled, fieldResolveSnap, false)
  }

  const runtime: FormRuntime = {
    createResolveSnap,
    resolveDisabled,
    resolveField,
    resolveNode,
    resolveSlot,
    resolveValue,
    resolveVisible,
    transformField,
  }

  return runtime
}
