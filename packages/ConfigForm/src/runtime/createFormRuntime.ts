import type { ComponentRegistry, FormRuntimeOptions, FormRuntimePlugin, FormRuntimeTokenResolver } from './types'
import type { FormRuntime } from './types'
import { createResolvers } from './resolve'
import { createResolveSnap } from './snap'
import { createTransform } from './transform'

/** 创建表单运行时实例，合并组件注册、插件 hook 和 token resolver。 */
export function createFormRuntime(options: FormRuntimeOptions = {}): FormRuntime {
  const plugins: FormRuntimePlugin[] = [...(options.plugins ?? [])]
  const components: ComponentRegistry = { ...(options.components ?? {}) }
  const tokenResolvers: Record<string, FormRuntimeTokenResolver> = {}

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
  }

  const transform = createTransform(plugins)
  const resolve = createResolvers(components, tokenResolvers, transform)

  return {
    createResolveSnap,
    resolveNode: resolve.resolveNode,
    resolveValue: resolve.resolveValue,
    resolveSlot: resolve.resolveSlot,
    transformNode: transform.transformNode,
    resolveVisible: resolve.resolveVisible,
    resolveDisabled: resolve.resolveDisabled,
  }
}

export { createRuntimeToken, isRuntimeToken } from './token'
