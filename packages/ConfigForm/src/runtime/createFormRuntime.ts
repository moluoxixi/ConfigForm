import type {
  ComponentRegistry,
  CreateRuntimeContextInput,
  FormRuntime,
  FormRuntimeConflict,
  FormRuntimeConflictStrategy,
  FormRuntimeContext,
  FormRuntimeExtension,
  FormRuntimeLocale,
  FormRuntimeOptions,
} from './types'
import type {
  ExpressionInput,
  ExpressionToken,
  FieldCondition,
  FieldConfig,
  FormValues,
  I18nToken,
  NormalizedFieldConfig,
  ResolvedField,
  SlotContent,
  SlotFieldConfig,
} from '@/types'
import { isVNode } from 'vue'
import { normalizeField } from '@/models/field'

export function i18n(key: string, fallback?: string, params?: Record<string, unknown>): I18nToken {
  return {
    __configFormToken: 'i18n',
    fallback,
    key,
    params,
  }
}

export function expr<TValue = unknown>(expression: ExpressionInput, fallback?: TValue): ExpressionToken<TValue> {
  return {
    __configFormToken: 'expr',
    expression,
    fallback,
  }
}

export function isI18nToken(value: unknown): value is I18nToken {
  return Boolean(
    value
    && typeof value === 'object'
    && (value as { __configFormToken?: unknown }).__configFormToken === 'i18n',
  )
}

export function isExpressionToken<TValue = unknown>(value: unknown): value is ExpressionToken<TValue> {
  return Boolean(
    value
    && typeof value === 'object'
    && (value as { __configFormToken?: unknown }).__configFormToken === 'expr',
  )
}

export function isFormRuntime(value: unknown): value is FormRuntime {
  return Boolean(
    value
    && typeof value === 'object'
    && (value as { __configFormRuntime?: unknown }).__configFormRuntime === true,
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

function isSlotFieldConfig(value: unknown): value is SlotFieldConfig {
  return Boolean(
    value
    && typeof value === 'object'
    && !Array.isArray(value)
    && !isVNode(value)
    && 'component' in value,
  )
}

function getByPath(source: unknown, path: string): unknown {
  if (!path)
    return source

  return path.split('.').reduce<unknown>((current, segment) => {
    if (current == null)
      return undefined
    if (typeof current !== 'object')
      return undefined
    return (current as Record<string, unknown>)[segment]
  }, source)
}

function resolvePath(input: { path: string, fallback?: unknown }, context: FormRuntimeContext): unknown {
  const root = {
    errors: context.errors,
    field: context.field,
    locale: context.locale,
    meta: context.meta,
    values: context.values,
  }
  const firstSegment = input.path.split('.')[0]
  const value = firstSegment && firstSegment in root
    ? getByPath(root, input.path)
    : getByPath(context.values, input.path)
  return value === undefined ? input.fallback : value
}

function defaultEvaluateExpression(input: ExpressionInput, context: FormRuntimeContext): unknown {
  if (input == null || typeof input !== 'object')
    return input

  if ('path' in input)
    return resolvePath(input, context)

  if ('op' in input) {
    switch (input.op) {
      case 'and':
        return input.items.every(item => Boolean(defaultEvaluateExpression(item, context)))
      case 'or':
        return input.items.some(item => Boolean(defaultEvaluateExpression(item, context)))
      case 'not':
        return !defaultEvaluateExpression(input.value, context)
      case 'includes': {
        const source = defaultEvaluateExpression(input.source, context)
        const value = defaultEvaluateExpression(input.value, context)
        return typeof source === 'string' || Array.isArray(source)
          ? source.includes(value as never)
          : false
      }
      case 'eq':
      case 'neq':
      case 'gt':
      case 'gte':
      case 'lt':
      case 'lte': {
        const left = defaultEvaluateExpression(input.left, context)
        const right = defaultEvaluateExpression(input.right, context)
        if (input.op === 'eq')
          return left === right
        if (input.op === 'neq')
          return left !== right
        if (input.op === 'gt')
          return Number(left) > Number(right)
        if (input.op === 'gte')
          return Number(left) >= Number(right)
        if (input.op === 'lt')
          return Number(left) < Number(right)
        return Number(left) <= Number(right)
      }
    }
  }

  return undefined
}

function normalizeExtensions(extensions: FormRuntimeExtension[] = []): FormRuntimeExtension[] {
  return [...extensions].sort((a, b) => (a.priority ?? 100) - (b.priority ?? 100))
}

function resolveLocale(locale?: FormRuntimeLocale): string | undefined {
  return typeof locale === 'function' ? locale() : locale
}

export function createFormRuntime(options: FormRuntimeOptions = {}): FormRuntime {
  const conflictStrategy: FormRuntimeConflictStrategy = options.conflictStrategy ?? 'error'
  const extensions = normalizeExtensions(options.extensions)
  const components: ComponentRegistry = { ...(options.components ?? {}) }
  let i18nAdapter: FormRuntimeExtension['i18n']

  function emitDebug(event: Parameters<FormRuntime['emitDebug']>[0]) {
    options.debug?.emit?.(event)
    for (const extension of extensions)
      extension.onDebugEvent?.(event)
  }

  function handleConflict(conflict: FormRuntimeConflict) {
    if (conflictStrategy === 'error')
      throw new Error(conflict.message)
    if (conflictStrategy === 'warn') {
      options.onConflict?.(conflict)
      emitDebug({
        data: { conflict },
        message: conflict.message,
        type: 'conflict',
      })
    }
  }

  const seenExtensionNames = new Set<string>()
  for (const extension of extensions) {
    if (seenExtensionNames.has(extension.name)) {
      handleConflict({
        incoming: extension,
        key: extension.name,
        message: `Duplicate extension name: ${extension.name}`,
        type: 'extension',
      })
    }
    else {
      seenExtensionNames.add(extension.name)
    }

    for (const [key, component] of Object.entries(extension.components ?? {})) {
      if (Object.hasOwn(components, key)) {
        handleConflict({
          existing: components[key],
          incoming: component,
          key,
          message: `Component key conflict: ${key}`,
          type: 'component',
        })
      }
      components[key] = component
    }

    if (extension.i18n) {
      if (i18nAdapter) {
        handleConflict({
          existing: i18nAdapter,
          incoming: extension.i18n,
          key: 'i18n',
          message: 'Multiple i18n plugins registered',
          type: 'extension',
        })
      }
      i18nAdapter = extension.i18n
    }
  }

  function currentLocale(): string | undefined {
    return resolveLocale(i18nAdapter?.locale)
  }

  function withCurrentLocale(context: FormRuntimeContext): FormRuntimeContext {
    return {
      ...context,
      locale: currentLocale(),
    }
  }

  function createContext<TValues extends FormValues = FormValues>(
    input: CreateRuntimeContextInput<TValues> = {},
  ): FormRuntimeContext<TValues> {
    return {
      errors: input.errors ?? {},
      field: input.field,
      locale: currentLocale(),
      meta: input.meta,
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

  function resolveToken(value: I18nToken | ExpressionToken, context: FormRuntimeContext): unknown {
    if (isI18nToken(value)) {
      if (!i18nAdapter)
        throw new Error(`No i18n plugin registered for token: ${value.key}`)

      const i18nContext = withCurrentLocale(context)
      const params = value.params
        ? resolveRecord(value.params, i18nContext, `${value.key}.params`)
        : undefined
      return i18nAdapter.translate(value.key, params, value.fallback, i18nContext)
    }

    const customResult = options.expression?.evaluate?.(value.expression, context)
    const result = customResult === undefined
      ? defaultEvaluateExpression(value.expression, context)
      : customResult
    return result === undefined ? value.fallback : result
  }

  function resolveRecord(
    value: Record<string, unknown>,
    context: FormRuntimeContext,
    path: string,
  ): Record<string, unknown> {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        resolveValue(item, context, `${path}.${key}`),
      ]),
    )
  }

  function resolveValue<TValue = unknown>(
    value: TValue,
    context: FormRuntimeContext,
    path = 'value',
  ): unknown {
    let resolved: unknown = value

    if (isI18nToken(resolved) || isExpressionToken(resolved)) {
      resolved = resolveToken(resolved, context)
    }
    else if (Array.isArray(resolved)) {
      resolved = resolved.map((item, index) => resolveValue(item, context, `${path}.${index}`))
    }
    else if (isPlainRecord(resolved) && !isVNode(resolved) && !isComponentLikeRecord(resolved)) {
      resolved = resolveRecord(resolved, context, path)
    }

    for (const extension of extensions) {
      const next = extension.resolveValue?.(resolved, context, path)
      if (next !== undefined) {
        resolved = next
        emitDebug({
          extension: extension.name,
          path,
          type: 'extension:resolved',
        })
      }
    }

    emitDebug({ path, type: 'value:resolved' })
    return resolved
  }

  function resolveSlotFieldConfig(
    config: SlotFieldConfig,
    context: FormRuntimeContext,
    path: string,
  ): NormalizedFieldConfig {
    const normalized = normalizeField({
      ...config,
      field: config.field ?? path.replace(/[^\w-]/g, '-'),
    } as FieldConfig)
    return {
      ...normalized,
      component: resolveComponent(normalized.component),
      label: normalized.label == null
        ? normalized.label
        : String(resolveValue(normalized.label, context, `${path}.label`)),
      props: resolveRecord(normalized.props, context, `${path}.props`),
      slots: config.slots
        ? Object.fromEntries(
            Object.entries(config.slots).map(([key, slot]) => [
              key,
              resolveSlot(slot, context, `${path}.slots.${key}`),
            ]),
          )
        : normalized.slots,
    }
  }

  function resolveSlotBase(slot: SlotContent, context: FormRuntimeContext, path: string): SlotContent {
    if (typeof slot === 'function') {
      return (scope?: Record<string, unknown>) => resolveSlotBase(
        slot(scope),
        {
          ...context,
          meta: {
            ...context.meta,
            slotScope: scope,
          },
        },
        path,
      )
    }

    if (Array.isArray(slot))
      return slot.map((item, index) => resolveSlotBase(item as SlotContent, context, `${path}.${index}`)) as SlotContent

    if (isSlotFieldConfig(slot))
      return resolveSlotFieldConfig(slot, context, path)

    return resolveValue(slot, context, path) as SlotContent
  }

  function resolveSlot(slot: SlotContent, context: FormRuntimeContext, path = 'slot'): SlotContent {
    let resolved = resolveSlotBase(slot, context, path)

    for (const extension of extensions) {
      const next = extension.resolveSlot?.(resolved, context, path)
      if (next !== undefined) {
        resolved = next
        emitDebug({
          extension: extension.name,
          path,
          type: 'extension:resolved',
        })
      }
    }

    return resolveSlotBase(resolved, context, path)
  }

  function resolveFieldBase(config: NormalizedFieldConfig, context: FormRuntimeContext): ResolvedField {
    return {
      ...config,
      component: resolveComponent(config.component),
      label: config.label == null
        ? config.label
        : String(resolveValue(config.label, context, `${config.field}.label`)),
      props: resolveRecord(config.props, context, `${config.field}.props`),
      slots: config.slots
        ? Object.fromEntries(
            Object.entries(config.slots).map(([key, slot]) => [
              key,
              resolveSlot(slot, context, `${config.field}.slots.${key}`),
            ]),
          )
        : config.slots,
    }
  }

  function prepareField(field: FieldConfig, context: FormRuntimeContext): NormalizedFieldConfig {
    let config = normalizeField(field)
    let fieldContext = { ...context, field: config }

    for (const extension of extensions) {
      const next = extension.prepareField?.(config, fieldContext)
      if (next) {
        config = normalizeField(next)
        fieldContext = { ...context, field: config }
        emitDebug({
          extension: extension.name,
          field: config.field,
          type: 'extension:resolved',
        })
      }
    }

    return config
  }

  function resolveField(field: FieldConfig, context: FormRuntimeContext): ResolvedField {
    const prepared = prepareField(field, context)
    const fieldContext = { ...context, field: prepared }
    let config = resolveFieldBase(prepared, fieldContext)

    for (const extension of extensions) {
      const next = extension.resolveField?.(config, fieldContext)
      if (next) {
        config = resolveFieldBase(normalizeField(next), fieldContext)
        emitDebug({
          extension: extension.name,
          field: config.field,
          type: 'extension:resolved',
        })
      }
    }

    emitDebug({
      field: config.field,
      type: 'field:resolved',
    })
    return config
  }

  function resolveConditionBase(
    condition: FieldCondition<FormValues> | undefined,
    context: FormRuntimeContext,
    fallback: boolean,
  ): boolean {
    if (condition == null)
      return fallback
    if (typeof condition === 'boolean')
      return condition
    if (isExpressionToken<boolean>(condition))
      return Boolean(resolveValue(condition, context, 'condition'))
    return condition(context.values)
  }

  function resolveVisible(field: FieldConfig | NormalizedFieldConfig, context: FormRuntimeContext): boolean {
    const normalized = normalizeField(field)
    const fieldContext = { ...context, field: normalized }
    const hooks = extensions.filter(extension => extension.resolveVisible)
    const base = () => resolveConditionBase(normalized.visible, fieldContext, true)
    const dispatch = (index: number): boolean => {
      const extension = hooks[index]
      if (!extension?.resolveVisible)
        return base()
      return extension.resolveVisible(normalized, fieldContext, () => dispatch(index + 1))
    }
    const result = dispatch(0)
    emitDebug({
      data: { result },
      field: normalized.field,
      type: 'condition:resolved',
    })
    return result
  }

  function resolveDisabled(field: FieldConfig | NormalizedFieldConfig, context: FormRuntimeContext): boolean {
    const normalized = normalizeField(field)
    const fieldContext = { ...context, field: normalized }
    const hooks = extensions.filter(extension => extension.resolveDisabled)
    const base = () => resolveConditionBase(normalized.disabled, fieldContext, false)
    const dispatch = (index: number): boolean => {
      const extension = hooks[index]
      if (!extension?.resolveDisabled)
        return base()
      return extension.resolveDisabled(normalized, fieldContext, () => dispatch(index + 1))
    }
    const result = dispatch(0)
    emitDebug({
      data: { result },
      field: normalized.field,
      type: 'condition:resolved',
    })
    return result
  }

  const runtime: FormRuntime = {
    __configFormRuntime: true,
    components,
    createContext,
    emitDebug,
    extensions,
    locale: currentLocale(),
    resolveDisabled,
    resolveField,
    resolveSlot,
    resolveValue,
    resolveVisible,
  }

  emitDebug({ type: 'runtime:created' })
  return runtime
}
