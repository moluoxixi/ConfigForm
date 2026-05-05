import type {
  ComponentRegistry,
  CreateRuntimeResolveSnapInput,
  FormFieldTransform,
  FormRuntime,
  FormRuntimeHookOrder,
  FormRuntimeOptions,
  FormRuntimePlugin,
  FormRuntimeResolveSnap,
  FormRuntimeTokenResolver,
} from './types'
import type {
  FieldConfig,
  FormNodeConfig,
  FormValues,
  NormalizedFieldConfig,
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

/**
 * 创建运行时 token 对象。
 *
 * payload 会参与后续 resolver 输入，保留字段原样透传；保留键冲突会直接抛错。
 */
export function createRuntimeToken<TValue = unknown, TType extends string = string>(
  type: TType,
): RuntimeToken<TValue, TType>
/** 创建带 payload 的运行时 token；payload 会原样传给 token resolver。 */
export function createRuntimeToken<
  TValue = unknown,
  TType extends string = string,
  TPayload extends Record<string, unknown> = Record<string, unknown>,
>(
  type: TType,
  payload: TPayload,
): RuntimeToken<TValue, TType> & TPayload
/**
 * 创建运行时 token 的实际对象结构。
 *
 * 该实现只校验保留键冲突，不验证业务 payload 内容，payload 语义由对应 resolver 负责。
 */
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

/**
 * 判断值是否是可递归解析的普通记录。
 *
 * 仅允许 object literal 或 null-prototype 对象进入 token 深度解析，避免误处理类实例。
 */
function isPlainRecord(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    return false
  const proto = Object.getPrototypeOf(value)
  return proto === Object.prototype || proto === null
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

    if (plugin.transformField) {
      const hook = plugin.transformField
      if (typeof hook === 'function') {
        fieldTransformHooks.push({ handler: hook, pluginName: plugin.name })
      }
      else if (hook && typeof hook === 'object' && typeof hook.handler === 'function') {
        if (hook.order !== undefined && hook.order !== 'pre' && hook.order !== 'post')
          throw new TypeError(`Plugin ${plugin.name} hook transformField.order must be "pre" or "post"`)
        fieldTransformHooks.push({ handler: hook.handler, order: hook.order, pluginName: plugin.name })
      }
      else {
        throw new TypeError(`Plugin ${plugin.name} hook transformField must be a function or an object hook`)
      }
    }
  }

  const orderedFieldTransformHooks = [
    ...fieldTransformHooks.filter(hook => hook.order === 'pre'),
    ...fieldTransformHooks.filter(hook => hook.order === undefined),
    ...fieldTransformHooks.filter(hook => hook.order === 'post'),
  ]

  /**
   * 创建 runtime 解析快照。
   *
   * 缺省字段仅表示解析上下文为空，不捕获或缓存后续表单状态变化。
   */
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

  /**
   * 解析组件注册表中的组件引用。
   *
   * 大写字符串必须命中注册表；未注册时抛错，避免组件 key 拼写错误被当作原生标签。
   */
  function resolveComponent(component: FieldConfig['component']): FieldConfig['component'] {
    if (typeof component === 'string' && Object.hasOwn(components, component))
      return components[component]
    if (typeof component === 'string' && /^[A-Z]/.test(component))
      throw new Error(`Unknown component key: ${component}`)
    return component
  }
  /**
   * 解析 runtime token、数组和普通对象中的动态值。
   *
   * Vue VNode、组件定义和非普通对象会保持原值，避免破坏组件/实例引用。
   */
  function resolveValue<TValue = unknown>(
    value: TValue,
    resolveSnap: FormRuntimeResolveSnap,
    path = 'value',
  ): unknown {
    let resolved: unknown = value

    if (isRuntimeToken(resolved)) {
      const resolver = tokenResolvers[resolved.__configFormToken]
      if (!resolver)
        throw new Error(`No token resolver registered for token type: ${resolved.__configFormToken}`)
      resolved = resolver(resolved, resolveSnap, path, { resolveValue })
    }
    else if (Array.isArray(resolved)) {
      resolved = resolved.map((item, index) => resolveValue(item, resolveSnap, `${path}.${index}`))
    }
    else if (
      isPlainRecord(resolved)
      && !isVNode(resolved)
      && !(resolved.__v_skip || resolved.setup || resolved.render || resolved.template || resolved.__vccOpts)
    ) {
      resolved = Object.fromEntries(
        Object.entries(resolved).map(([key, item]) => [
          key,
          resolveValue(item, resolveSnap, `${path}.${key}`),
        ]),
      )
    }

    return resolved
  }

  /**
   * 解析任意表单节点。
   *
   * 已解析节点直接返回；字段节点进入字段解析链，容器节点进入容器解析链。
   */
  function resolveNode(node: FormNodeConfig, resolveSnap: FormRuntimeResolveSnap, path = 'node'): ResolvedFormNode {
    if (isResolvedFormNodeConfig(node))
      return node

    if (isFieldConfig(node))
      return resolveField(node, resolveSnap)

    assertComponentNodeConfig(node, path)

    return markResolvedFormNodeConfig({
      ...node,
      component: resolveComponent(node.component),
      props: Object.fromEntries(
        Object.entries(node.props ?? {}).map(([key, item]) => [
          key,
          resolveValue(item, resolveSnap, `${path}.props.${key}`),
        ]),
      ),
      slots: node.slots
        ? Object.fromEntries(
          Object.entries(node.slots).map(([key, slot]) => [
            key,
            resolveSlot(slot, { ...resolveSnap, slotName: key }, `${path}.slots.${key}`),
          ]),
        )
        : node.slots,
    })
  }

  /**
   * 解析 slot 内容并保留函数 slot 的运行时调用能力。
   *
   * slot 返回节点配置时必须由 defineField 创建；非法节点会抛错而不是静默忽略。
   */
  function resolveSlot(slot: SlotContent, resolveSnap: FormRuntimeResolveSnap, path = 'slot'): SlotContent {
    if (typeof slot === 'function') {
      return (scope?: Record<string, unknown>) => resolveSlot(
        slot(scope),
        {
          ...resolveSnap,
          slotScope: scope,
        },
        path,
      )
    }

    if (Array.isArray(slot))
      return slot.map((item, index) => resolveSlot(item as SlotContent, resolveSnap, `${path}.${index}`)) as SlotContent

    if (isFormNodeConfig(slot)) {
      if (isResolvedFormNodeConfig(slot))
        return slot

      assertDefinedSlotNodeConfig(slot, path)
      return resolveNode(slot, resolveSnap, path) as SlotContent
    }

    return resolveValue(slot, resolveSnap, path) as SlotContent
  }

  /**
   * 标准化字段并按顺序执行插件 transformField hook。
   *
   * 插件只能返回同一 field key 的字段对象或 undefined；改变 field key 会直接抛错。
   */
  function transformField(
    field: FieldConfig | NormalizedFieldConfig,
  ): NormalizedFieldConfig {
    if (
      isResolvedFieldConfig(field)
      || (field && typeof field === 'object' && (field as unknown as Record<symbol, unknown>)[CONFIG_FORM_TRANSFORMED_FIELD] === true)
    ) {
      return field as NormalizedFieldConfig
    }

    let config = normalizeField(field)

    for (const hook of orderedFieldTransformHooks) {
      const hookField = {
        ...config,
        props: { ...config.props },
        slots: config.slots ? { ...config.slots } : config.slots,
      }

      const next = hook.handler(hookField)
      if (next === undefined)
        continue

      if (!next || typeof next !== 'object' || Array.isArray(next))
        throw new TypeError(`Plugin ${hook.pluginName} transformField must return a field object or undefined`)

      const normalized = normalizeField(next as FieldConfig)
      if (normalized.field !== config.field) {
        throw new Error(
          `Plugin ${hook.pluginName} transformField cannot change field key from "${config.field}" to "${normalized.field}"`,
        )
      }

      config = normalized
    }

    Object.defineProperty(config, CONFIG_FORM_TRANSFORMED_FIELD, {
      configurable: false,
      enumerable: false,
      value: true,
      writable: false,
    })

    return config as NormalizedFieldConfig
  }

  /**
   * 解析真实字段节点。
   *
   * 已解析字段直接返回；未解析字段会先执行 transformField，再解析组件、label、props 和 slots。
   */
  function resolveField(field: FieldConfig, resolveSnap: FormRuntimeResolveSnap): ResolvedField {
    if (isResolvedFieldConfig(field))
      return field

    const transformed = transformField(field)
    const fieldResolveSnap = { ...resolveSnap, field: transformed }
    return markResolvedFormNodeConfig({
      ...transformed,
      component: resolveComponent(transformed.component),
      label: transformed.label == null
        ? transformed.label
        : String(resolveValue(transformed.label, fieldResolveSnap, `${transformed.field}.label`)),
      props: Object.fromEntries(
        Object.entries(transformed.props).map(([key, item]) => [
          key,
          resolveValue(item, fieldResolveSnap, `${transformed.field}.props.${key}`),
        ]),
      ),
      slots: transformed.slots
        ? Object.fromEntries(
          Object.entries(transformed.slots).map(([key, slot]) => [
            key,
            resolveSlot(slot, { ...fieldResolveSnap, slotName: key }, `${transformed.field}.slots.${key}`),
          ]),
        )
        : transformed.slots,
    })
  }

  /**
   * 解析字段可见性。
   *
   * 缺省 visible 视为 true，动态条件会使用包含当前 field 的 resolveSnap。
   */
  function resolveVisible(field: FieldConfig | NormalizedFieldConfig, resolveSnap: FormRuntimeResolveSnap): boolean {
    const transformed = transformField(field)
    const fieldResolveSnap = { ...resolveSnap, field: transformed }
    const condition = transformed.visible
    if (condition == null) return true
    if (typeof condition === 'boolean') return condition
    if (isRuntimeToken<boolean>(condition))
      return Boolean(resolveValue(condition, fieldResolveSnap, 'condition'))
    return condition(fieldResolveSnap.values)
  }

  /**
   * 解析字段禁用状态。
   *
   * 缺省 disabled 视为 false，动态条件会使用包含当前 field 的 resolveSnap。
   */
  function resolveDisabled(field: FieldConfig | NormalizedFieldConfig, resolveSnap: FormRuntimeResolveSnap): boolean {
    const transformed = transformField(field)
    const fieldResolveSnap = { ...resolveSnap, field: transformed }
    const condition = transformed.disabled
    if (condition == null) return false
    if (typeof condition === 'boolean') return condition
    if (isRuntimeToken<boolean>(condition))
      return Boolean(resolveValue(condition, fieldResolveSnap, 'condition'))
    return condition(fieldResolveSnap.values)
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
