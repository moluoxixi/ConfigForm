import type { FormRuntimeHookOrder, FormRuntimePlugin, FormNodeTransform } from './types'
import type { DefinedFormNodeConfig, NormalizedFieldConfig, NormalizedNodeConfig } from '@/types'
import { hasFieldBinding } from './guards'
import { normalizeFieldBinding, normalizeNode } from './normalize'

interface RuntimeHook<THandler extends (...args: never[]) => unknown> {
  handler: THandler
  order?: FormRuntimeHookOrder
  pluginName: string
}

export interface TransformContext {
  transformNode: (node: DefinedFormNodeConfig) => NormalizedNodeConfig
}

const CONFIG_FORM_TRANSFORMED_NODE = Symbol('config-form.transformed-node')

function isTransformedNode(node: unknown): boolean {
  return Boolean(
    node
    && typeof node === 'object'
    && (node as Record<symbol, unknown>)[CONFIG_FORM_TRANSFORMED_NODE] === true,
  )
}

function markTransformedNode(node: NormalizedNodeConfig): NormalizedNodeConfig {
  if (!((node as unknown as Record<symbol, unknown>)[CONFIG_FORM_TRANSFORMED_NODE])) {
    Object.defineProperty(node, CONFIG_FORM_TRANSFORMED_NODE, {
      configurable: false,
      enumerable: false,
      value: true,
      writable: false,
    })
  }
  return node
}

export function createTransform(plugins: FormRuntimePlugin[]): TransformContext {
  const orderedHooks = collectOrderedHooks(plugins)

  function transformNode(node: DefinedFormNodeConfig): NormalizedNodeConfig {
    if (isTransformedNode(node))
      return node as NormalizedNodeConfig

    let config: NormalizedNodeConfig = normalizeNode(node)
    if (hasFieldBinding(config))
      config = normalizeFieldBinding(config as NormalizedNodeConfig & { field: string })

    for (const hook of orderedHooks) {
      const next = hook.handler({
        ...config,
        props: { ...config.props },
        slots: config.slots ? { ...config.slots } : config.slots,
      })
      if (next === undefined)
        continue
      if (!next || typeof next !== 'object' || Array.isArray(next))
        throw new TypeError(`Plugin ${hook.pluginName} transformNode must return a node object or undefined`)
      if (hasFieldBinding(next) && hasFieldBinding(config) && next.field !== (config as NormalizedFieldConfig).field)
        throw new Error(`Plugin ${hook.pluginName} cannot change field key from "${(config as NormalizedFieldConfig).field}" to "${(next as NormalizedFieldConfig).field}"`)
      config = next as NormalizedNodeConfig
    }

    return markTransformedNode(config)
  }

  return { transformNode }
}

function collectOrderedHooks(plugins: FormRuntimePlugin[]): RuntimeHook<FormNodeTransform>[] {
  const hooks: RuntimeHook<FormNodeTransform>[] = []

  for (const plugin of plugins) {
    if (!plugin.transformNode)
      continue

    const hook = plugin.transformNode
    if (typeof hook === 'function') {
      hooks.push({ handler: hook, pluginName: plugin.name })
    }
    else if (hook && typeof hook === 'object' && typeof hook.handler === 'function') {
      if (hook.order !== undefined && hook.order !== 'pre' && hook.order !== 'post')
        throw new TypeError(`Plugin ${plugin.name} hook transformNode.order must be "pre" or "post"`)
      hooks.push({ handler: hook.handler, order: hook.order, pluginName: plugin.name })
    }
    else {
      throw new TypeError(`Plugin ${plugin.name} hook transformNode must be a function or an object hook`)
    }
  }

  return [
    ...hooks.filter(hook => hook.order === 'pre'),
    ...hooks.filter(hook => hook.order === undefined),
    ...hooks.filter(hook => hook.order === 'post'),
  ]
}
