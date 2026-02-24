import type { Component } from 'vue'

/**
 * 组件注册选项。
 */
export interface RegisterComponentOptions {
  /** 当前组件默认绑定的装饰器名称。 */
  defaultDecorator?: string
  /** 预览态下替换使用的只读组件。 */
  readPrettyComponent?: Component
}

/**
 * 组件作用域描述。
 * 用于构建“实例级注册表”，避免污染全局组件映射。
 */
export interface ComponentScope {
  components: Record<string, Component>
  decorators: Record<string, Component>
  actions: Record<string, Component>
  defaultDecorators: Record<string, string>
  readPrettyComponents: Record<string, Component>
}

/**
 * 运行时注册表结构。
 */
export interface RegistryState {
  components: Map<string, Component>
  decorators: Map<string, Component>
  actions: Map<string, Component>
  defaultDecorators: Map<string, string>
  readPrettyComponents: Map<string, Component>
}

/**
 * 创建空注册表实例。
 * @returns 返回初始化完成的注册表对象。
 */
export function createRegistryState(): RegistryState {
  return {
    components: new Map<string, Component>(),
    decorators: new Map<string, Component>(),
    actions: new Map<string, Component>(),
    defaultDecorators: new Map<string, string>(),
    readPrettyComponents: new Map<string, Component>(),
  }
}

/**
 * 全局注册表实例。
 */
const globalRegistry = createRegistryState()

/**
 * 注册表变化监听池。
 */
const registryListeners = new WeakMap<RegistryState, Set<() => void>>()

/**
 * 获取目标注册表。
 * @param registry 可选目标注册表。
 * @returns 返回传入的注册表，未传入时返回全局注册表。
 */
function getTargetRegistry(registry?: RegistryState): RegistryState {
  return registry ?? globalRegistry
}

/**
 * 广播注册表变化。
 * @param registry 发生变更的注册表实例。
 */
function notifyRegistryChange(registry: RegistryState): void {
  const listeners = registryListeners.get(registry)
  if (!listeners) {
    return
  }
  for (const listener of listeners) {
    listener()
  }
}

/**
 * 订阅注册表变化。
 *
 * @param registry 目标注册表实例。
 * @param listener 注册表变化时触发的回调。
 * @returns 返回取消订阅函数。
 */
export function subscribeRegistryChange(registry: RegistryState, listener: () => void): () => void {
  let listeners = registryListeners.get(registry)
  if (!listeners) {
    listeners = new Set<() => void>()
    registryListeners.set(registry, listeners)
  }
  listeners.add(listener)

  return () => {
    listeners?.delete(listener)
    if (listeners && listeners.size === 0) {
      registryListeners.delete(registry)
    }
  }
}

/**
 * 向全局注册表注册单个组件。
 * @param name 组件名称。
 * @param component Vue 组件实现。
 * @param options 注册选项。
 */
export function registerComponent(name: string, component: Component, options?: RegisterComponentOptions): void {
  registerComponentToRegistry(getTargetRegistry(), name, component, options)
}

/**
 * 向指定注册表注册单个组件。
 * @param registry 目标注册表实例。
 * @param name 组件名称。
 * @param component Vue 组件实现。
 * @param options 注册选项。
 */
export function registerComponentToRegistry(
  registry: RegistryState,
  name: string,
  component: Component,
  options?: RegisterComponentOptions,
): void {
  registry.components.set(name, component)
  if (options?.defaultDecorator) {
    registry.defaultDecorators.set(name, options.defaultDecorator)
  }
  if (options?.readPrettyComponent) {
    registry.readPrettyComponents.set(name, options.readPrettyComponent)
  }
  notifyRegistryChange(registry)
}

/**
 * 向全局注册表注册装饰器组件。
 * @param name 装饰器名称。
 * @param decorator 装饰器组件实现。
 */
export function registerDecorator(name: string, decorator: Component): void {
  registerDecoratorToRegistry(getTargetRegistry(), name, decorator)
}

/**
 * 向指定注册表注册装饰器组件。
 * @param registry 目标注册表实例。
 * @param name 装饰器名称。
 * @param decorator 装饰器组件实现。
 */
export function registerDecoratorToRegistry(
  registry: RegistryState,
  name: string,
  decorator: Component,
): void {
  registry.decorators.set(name, decorator)
  notifyRegistryChange(registry)
}

/**
 * 向全局注册表注册操作组件。
 * @param name 操作名称。
 * @param action 操作组件实现。
 */
export function registerAction(name: string, action: Component): void {
  registerActionToRegistry(getTargetRegistry(), name, action)
}

/**
 * 向指定注册表注册操作组件。
 * @param registry 目标注册表实例。
 * @param name 操作名称。
 * @param action 操作组件实现。
 */
export function registerActionToRegistry(
  registry: RegistryState,
  name: string,
  action: Component,
): void {
  registry.actions.set(name, action)
  notifyRegistryChange(registry)
}

/**
 * 向全局注册表批量注册组件。
 * @param mapping 组件映射表。
 * @param options 注册选项。
 */
export function registerComponents(mapping: Record<string, Component>, options?: RegisterComponentOptions): void {
  registerComponentsToRegistry(getTargetRegistry(), mapping, options)
}

/**
 * 向指定注册表批量注册组件。
 * @param registry 目标注册表实例。
 * @param mapping 组件映射表。
 * @param options 注册选项。
 */
export function registerComponentsToRegistry(
  registry: RegistryState,
  mapping: Record<string, Component>,
  options?: RegisterComponentOptions,
): void {
  for (const [name, component] of Object.entries(mapping)) {
    registry.components.set(name, component)
    if (options?.defaultDecorator) {
      registry.defaultDecorators.set(name, options.defaultDecorator)
    }
    if (options?.readPrettyComponent) {
      registry.readPrettyComponents.set(name, options.readPrettyComponent)
    }
  }
  notifyRegistryChange(registry)
}

/**
 * 向全局注册表批量注册操作组件。
 * @param mapping 操作组件映射表。
 */
export function registerActions(mapping: Record<string, Component>): void {
  registerActionsToRegistry(getTargetRegistry(), mapping)
}

/**
 * 向指定注册表批量注册操作组件。
 * @param registry 目标注册表实例。
 * @param mapping 操作组件映射表。
 */
export function registerActionsToRegistry(
  registry: RegistryState,
  mapping: Record<string, Component>,
): void {
  for (const [name, action] of Object.entries(mapping)) {
    registry.actions.set(name, action)
  }
  notifyRegistryChange(registry)
}

/**
 * 向全局注册表批量注册字段组件与默认装饰器。
 *
 * @param fields 字段组件映射表。
 * @param decorator 默认装饰器定义。
 * @param decorator.name 默认装饰器名称。
 * @param decorator.component 默认装饰器组件。
 * @param layouts 布局组件映射表。
 * @param readPretty 预览态组件映射表。
 */
export function registerFieldComponents(
  fields: Record<string, Component>,
  decorator: { name: string, component: Component },
  layouts?: Record<string, Component>,
  readPretty?: Record<string, Component>,
): void {
  registerFieldComponentsToRegistry(getTargetRegistry(), fields, decorator, layouts, readPretty)
}

/**
 * 向指定注册表批量注册字段组件与默认装饰器。
 * @param registry 目标注册表实例。
 * @param fields 字段组件映射表。
 * @param decorator 默认装饰器定义。
 * @param decorator.name 默认装饰器名称。
 * @param decorator.component 默认装饰器组件。
 * @param layouts 布局组件映射表。
 * @param readPretty 预览态组件映射表。
 */
export function registerFieldComponentsToRegistry(
  registry: RegistryState,
  fields: Record<string, Component>,
  decorator: { name: string, component: Component },
  layouts?: Record<string, Component>,
  readPretty?: Record<string, Component>,
): void {
  registry.decorators.set(decorator.name, decorator.component)

  for (const [name, component] of Object.entries(fields)) {
    registry.components.set(name, component)
    registry.defaultDecorators.set(name, decorator.name)
  }

  if (layouts) {
    for (const [name, component] of Object.entries(layouts)) {
      registry.components.set(name, component)
    }
  }

  if (readPretty) {
    for (const [name, component] of Object.entries(readPretty)) {
      registry.readPrettyComponents.set(name, component)
    }
  }

  notifyRegistryChange(registry)
}

/**
 * 从全局注册表获取组件。
 * @param name 组件名称。
 * @returns 返回组件实现；未注册时返回 `undefined`。
 */
export function getComponent(name: string): Component | undefined {
  return globalRegistry.components.get(name)
}

/**
 * 从全局注册表获取装饰器。
 * @param name 装饰器名称。
 * @returns 返回装饰器实现；未注册时返回 `undefined`。
 */
export function getDecorator(name: string): Component | undefined {
  return globalRegistry.decorators.get(name)
}

/**
 * 从全局注册表获取操作组件。
 * @param name 操作名称。
 * @returns 返回操作组件；未注册时返回 `undefined`。
 */
export function getAction(name: string): Component | undefined {
  return globalRegistry.actions.get(name)
}

/**
 * 获取组件默认装饰器名称。
 * @param componentName 组件名称。
 * @returns 返回默认装饰器名称；未配置时返回 `undefined`。
 */
export function getDefaultDecorator(componentName: string): string | undefined {
  return globalRegistry.defaultDecorators.get(componentName)
}

/**
 * 获取组件的 readPretty 替代实现。
 * @param componentName 组件名称。
 * @returns 返回 readPretty 组件；未配置时返回 `undefined`。
 */
export function getReadPrettyComponent(componentName: string): Component | undefined {
  return globalRegistry.readPrettyComponents.get(componentName)
}

/**
 * 读取全局注册表实例。
 * @returns 返回全局注册表对象。
 */
export function getGlobalRegistry(): RegistryState {
  return globalRegistry
}

/**
 * 重置全局注册表。
 * 通常用于测试隔离，避免跨用例污染。
 */
export function resetRegistry(): void {
  globalRegistry.components.clear()
  globalRegistry.decorators.clear()
  globalRegistry.actions.clear()
  globalRegistry.defaultDecorators.clear()
  globalRegistry.readPrettyComponents.clear()
  notifyRegistryChange(globalRegistry)
}

/**
 * 创建隔离注册表并执行注册回调。
 * @param setup 注册逻辑回调。
 * @returns 返回填充后的隔离注册表实例。
 */
export function createRegistry(
  setup?: (register: {
    component: (name: string, comp: Component, options?: RegisterComponentOptions) => void
    decorator: (name: string, decorator: Component) => void
    action: (name: string, action: Component) => void
    components: (mapping: Record<string, Component>, options?: RegisterComponentOptions) => void
    actions: (mapping: Record<string, Component>) => void
    fieldComponents: (
      fields: Record<string, Component>,
      decorator: { name: string, component: Component },
      layouts?: Record<string, Component>,
      readPretty?: Record<string, Component>,
    ) => void
  }) => void,
): RegistryState {
  const registry = createRegistryState()

  setup?.({
    /** 注册单个组件到隔离注册表。 */
    component: (name, comp, options) => registerComponentToRegistry(registry, name, comp, options),
    /** 注册单个装饰器到隔离注册表。 */
    decorator: (name, decorator) => registerDecoratorToRegistry(registry, name, decorator),
    /** 注册单个操作组件到隔离注册表。 */
    action: (name, action) => registerActionToRegistry(registry, name, action),
    /** 批量注册组件到隔离注册表。 */
    components: (mapping, options) => registerComponentsToRegistry(registry, mapping, options),
    /** 批量注册操作组件到隔离注册表。 */
    actions: mapping => registerActionsToRegistry(registry, mapping),
    /** 批量注册字段组件、默认装饰器与扩展映射。 */
    fieldComponents: (fields, decorator, layouts, readPretty) =>
      registerFieldComponentsToRegistry(registry, fields, decorator, layouts, readPretty),
  })

  return registry
}

/**
 * 创建组件作用域对象。
 * 该对象可传给 `FormProvider` 或 `ConfigForm` 作为实例级隔离映射。
 *
 * @param setup 作用域构建回调。
 * @returns 返回可直接注入的组件作用域对象。
 */
export function createComponentScope(
  setup: (register: {
    component: (name: string, comp: Component, options?: RegisterComponentOptions) => void
    decorator: (name: string, decorator: Component) => void
    action: (name: string, action: Component) => void
    defaultDecorator: (componentName: string, decoratorName: string) => void
    readPretty: (componentName: string, component: Component) => void
  }) => void,
): ComponentScope {
  const components: Record<string, Component> = {}
  const decorators: Record<string, Component> = {}
  const actions: Record<string, Component> = {}
  const defaultDecorators: Record<string, string> = {}
  const readPrettyComponents: Record<string, Component> = {}

  setup({
    /** 注册作用域内组件。 */
    component: (name, comp, options) => {
      components[name] = comp
      if (options?.defaultDecorator) {
        defaultDecorators[name] = options.defaultDecorator
      }
      if (options?.readPrettyComponent) {
        readPrettyComponents[name] = options.readPrettyComponent
      }
    },
    /** 注册作用域内装饰器。 */
    decorator: (name, decorator) => {
      decorators[name] = decorator
    },
    /** 注册作用域内操作组件。 */
    action: (name, action) => {
      actions[name] = action
    },
    /** 显式设置组件默认装饰器。 */
    defaultDecorator: (componentName, decoratorName) => {
      defaultDecorators[componentName] = decoratorName
    },
    /** 设置组件 readPretty 替代实现。 */
    readPretty: (componentName, component) => {
      readPrettyComponents[componentName] = component
    },
  })

  return { components, decorators, actions, defaultDecorators, readPrettyComponents }
}
