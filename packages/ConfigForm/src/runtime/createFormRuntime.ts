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

/**
 * 判断普通记录是否更像 Vue 组件定义。
 *
 * 命中时 runtime 会把它当作组件值保留，不继续递归解析内部字段。
 */
function isComponentLikeRecord(value: Record<string, unknown>): boolean {
  return Boolean(
    value.__v_skip
    || value.setup
    || value.render
    || value.template
    || value.__vccOpts,
  )
}

/**
 * 判断字段配置是否已经经过 transformField 标准化。
 *
 * 该 brand 用于避免重复执行插件 hook，同时不暴露到枚举结果中。
 */
function isTransformedFieldConfig(value: unknown): value is NormalizedFieldConfig {
  return Boolean(
    value
    && typeof value === 'object'
    && (value as Record<symbol, unknown>)[CONFIG_FORM_TRANSFORMED_FIELD] === true,
  )
}

/**
 * 标记已标准化字段配置。
 *
 * 该函数会原地写入不可枚举 brand，调用方必须传入当前 runtime 拥有的字段副本。
 */
function markTransformedFieldConfig<TField extends NormalizedFieldConfig>(field: TField): TField {
  Object.defineProperty(field, CONFIG_FORM_TRANSFORMED_FIELD, {
    configurable: false,
    enumerable: false,
    value: true,
    writable: false,
  })

  return field
}

/**
 * 克隆传给插件 hook 的标准化字段。
 *
 * 仅浅拷贝 props 和 slots，避免插件直接改写当前 runtime 已缓存的字段对象。
 */
function cloneNormalizedField(field: NormalizedFieldConfig): NormalizedFieldConfig {
  return {
    ...field,
    props: { ...field.props },
    slots: field.slots ? { ...field.slots } : field.slots,
  }
}

/**
 * 规范化插件 hook 配置。
 *
 * 支持函数式和带 order 的对象式 hook；非法结构直接抛错以暴露插件配置问题。
 */
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

/**
 * 按 pre、默认、post 顺序排列同类 hook。
 *
 * 同一 order 内保持插件声明顺序，避免跨插件执行顺序出现隐式重排。
 */
function orderHooks<THandler extends (...args: never[]) => unknown>(
  hooks: RuntimeHook<THandler>[],
): RuntimeHook<THandler>[] {
  const pre = hooks.filter(hook => hook.order === 'pre')
  const normal = hooks.filter(hook => hook.order === undefined)
  const post = hooks.filter(hook => hook.order === 'post')
  return [...pre, ...normal, ...post]
}

/**
 * 为 slot 解析派生一次性上下文。
 *
 * 只补充当前 slotName，不修改父级 resolveSnap 的其他字段。
 */
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
   * 通过已注册 resolver 解析 runtime token。
   *
   * 未注册 token type 会直接抛错；resolver 抛出的错误保持原始失败语义。
   */
  function resolveToken(value: RuntimeToken, resolveSnap: FormRuntimeResolveSnap, path: string): unknown {
    const resolver = tokenResolvers[value.__configFormToken]
    if (!resolver)
      throw new Error(`No token resolver registered for token type: ${value.__configFormToken}`)

    return resolver(value, resolveSnap, path, { resolveValue })
  }

  /**
   * 递归解析普通对象的每个字段。
   *
   * path 会随着属性名扩展，用于 token resolver 或错误消息定位。
   */
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

  /**
   * 解析容器节点的组件、props 和 slots。
   *
   * 调用前不要求节点已标准化，但会校验无 field 容器不能使用字段专属配置。
   */
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

    return resolveComponentNodeBase(node, resolveSnap, path)
  }

  /**
   * 解析 slot 内容并保留函数 slot 的运行时调用能力。
   *
   * slot 返回节点配置时必须由 defineField 创建；非法节点会抛错而不是静默忽略。
   */
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

  /**
   * 解析公开 slot 内容入口。
   *
   * path 默认指向 slot 根，用于递归解析时拼接错误定位信息。
   */
  function resolveSlot(slot: SlotContent, resolveSnap: FormRuntimeResolveSnap, path = 'slot'): SlotContent {
    return resolveSlotBase(slot, resolveSnap, path)
  }

  /**
   * 解析已标准化字段的组件、label、props 和 slots。
   *
   * 该函数不执行插件 transform，调用方必须先传入当前 runtime 的标准化字段。
   */
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

  /**
   * 标准化字段并按顺序执行插件 transformField hook。
   *
   * 插件只能返回同一 field key 的字段对象或 undefined；改变 field key 会直接抛错。
   */
  function transformField(
    field: FieldConfig | NormalizedFieldConfig,
  ): NormalizedFieldConfig {
    if (isResolvedFieldConfig(field) || isTransformedFieldConfig(field))
      return field

    let config = normalizeField(field)

    for (const hook of orderedFieldTransformHooks) {
      const hookField = cloneNormalizedField(config)
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

    return markTransformedFieldConfig(config)
  }

  /**
   * 解析真实字段节点。
   *
   * 已解析字段直接返回；未解析字段会先执行 transformField，再带 field 上下文解析动态配置。
   */
  function resolveField(field: FieldConfig, resolveSnap: FormRuntimeResolveSnap): ResolvedField {
    if (isResolvedFieldConfig(field))
      return field

    const transformed = transformField(field)
    const fieldResolveSnap = { ...resolveSnap, field: transformed }
    return resolveFieldBase(transformed, fieldResolveSnap)
  }

  /**
   * 解析 visible/disabled 条件。
   *
   * fallback 只表示业务默认值，runtime token 或条件函数抛错时保持失败可见。
   */
  function resolveConditionBase(
    condition: FieldCondition<FormValues> | undefined,
    resolveSnap: FormRuntimeResolveSnap,
    fallback: boolean,
  ): boolean {
    // fallback 只表示 visible/disabled 的业务默认值，不能吞掉 resolver 或条件函数抛出的错误。
    if (condition == null)
      return fallback
    if (typeof condition === 'boolean')
      return condition
    if (isRuntimeToken<boolean>(condition))
      return Boolean(resolveValue(condition, resolveSnap, 'condition'))
    return condition(resolveSnap.values)
  }

  /**
   * 解析字段可见性。
   *
   * 缺省 visible 视为 true，动态条件会使用包含当前 field 的 resolveSnap。
   */
  function resolveVisible(field: FieldConfig | NormalizedFieldConfig, resolveSnap: FormRuntimeResolveSnap): boolean {
    const transformed = transformField(field)
    const fieldResolveSnap = { ...resolveSnap, field: transformed }
    return resolveConditionBase(transformed.visible, fieldResolveSnap, true)
  }

  /**
   * 解析字段禁用状态。
   *
   * 缺省 disabled 视为 false，动态条件会使用包含当前 field 的 resolveSnap。
   */
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
