import type { ComponentType } from 'react'

/**
 * 组件注册选项。
 */
export interface RegisterComponentOptions {
  /** 当前组件默认绑定的装饰器名称。 */
  defaultDecorator?: string
  /** 预览态下替换使用的只读组件。 */
  readPrettyComponent?: ComponentType<any>
}

/**
 * 组件作用域描述。
 * 用于构建“实例级注册表”，避免污染全局组件映射。
 */
export interface ComponentScope {
  components: Record<string, ComponentType<any>>
  decorators: Record<string, ComponentType<any>>
  actions: Record<string, ComponentType<any>>
  defaultDecorators: Record<string, string>
  readPrettyComponents: Record<string, ComponentType<any>>
}

/**
 * 运行时注册表结构。
 * 内部统一使用 `Map`，便于增量更新与高频查询。
 */
export interface RegistryState {
  components: Map<string, ComponentType<any>>
  decorators: Map<string, ComponentType<any>>
  actions: Map<string, ComponentType<any>>
  defaultDecorators: Map<string, string>
  readPrettyComponents: Map<string, ComponentType<any>>
}

/**
 * 创建空注册表。
 * @returns 返回初始化完成的注册表对象。
 */
export function createRegistryState(): RegistryState {
  return {
    components: new Map<string, ComponentType<any>>(),
    decorators: new Map<string, ComponentType<any>>(),
    actions: new Map<string, ComponentType<any>>(),
    defaultDecorators: new Map<string, string>(),
    readPrettyComponents: new Map<string, ComponentType<any>>(),
  }
}

/**
 * 全局注册表实例。
 * 未显式传入实例级注册表时，所有注册行为都会写入这里。
 */
const globalRegistry = createRegistryState()

/**
 * 注册表变化监听池。
 * 键为注册表实例，值为该实例对应的监听器集合。
 */
const registryListeners = new WeakMap<RegistryState, Set<() => void>>()

/**
 * 获取目标注册表。
 * @param registry 可选的目标注册表实例。
 * @returns 返回传入的注册表，未传入时回退到全局注册表。
 */
function getTargetRegistry(registry?: RegistryState): RegistryState {
  return registry ?? globalRegistry
}

/**
 * 广播注册表变更事件。
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
 * 常用于 `FormProvider` 侦听注册表增量更新并触发重渲染。
 *
 * @param registry 目标注册表实例。
 * @param listener 注册表变化时的回调函数。
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
 * @param name 组件名称，对应 schema 中的 `component`。
 * @param component React 组件实现。
 * @param options 注册选项。
 */
export function registerComponent(name: string, component: ComponentType<any>, options?: RegisterComponentOptions): void {
  registerComponentToRegistry(getTargetRegistry(), name, component, options)
}

/**
 * 向指定注册表注册单个组件。
 * @param registry 目标注册表实例。
 * @param name 组件名称。
 * @param component React 组件实现。
 * @param options 注册选项。
 */
export function registerComponentToRegistry(
  registry: RegistryState,
  name: string,
  component: ComponentType<any>,
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
export function registerDecorator(name: string, decorator: ComponentType<any>): void {
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
  decorator: ComponentType<any>,
): void {
  registry.decorators.set(name, decorator)
  notifyRegistryChange(registry)
}

/**
 * 向全局注册表注册操作组件。
 * @param name 操作名称。
 * @param action 操作组件实现。
 */
export function registerAction(name: string, action: ComponentType<any>): void {
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
  action: ComponentType<any>,
): void {
  registry.actions.set(name, action)
  notifyRegistryChange(registry)
}

/**
 * 向全局注册表批量注册组件。
 * @param mapping 组件映射表。
 * @param options 注册选项。
 */
export function registerComponents(mapping: Record<string, ComponentType<any>>, options?: RegisterComponentOptions): void {
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
  mapping: Record<string, ComponentType<any>>,
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
export function registerActions(mapping: Record<string, ComponentType<any>>): void {
  registerActionsToRegistry(getTargetRegistry(), mapping)
}

/**
 * 向指定注册表批量注册操作组件。
 * @param registry 目标注册表实例。
 * @param mapping 操作组件映射表。
 */
export function registerActionsToRegistry(
  registry: RegistryState,
  mapping: Record<string, ComponentType<any>>,
): void {
  for (const [name, action] of Object.entries(mapping)) {
    registry.actions.set(name, action)
  }
  notifyRegistryChange(registry)
}

/**
 * 向全局注册表批量注册字段组件与默认装饰器。
 *
 * 该方法用于 UI 适配层一站式注册：
 * 1. 字段组件自动绑定默认装饰器。
 * 2. 可选注册布局组件（不绑定默认装饰器）。
 * 3. 可选注册 readPretty 映射。
 *
 * @param fields 字段组件映射表。
 * @param decorator 默认装饰器定义。
 * @param decorator.name 默认装饰器名称。
 * @param decorator.component 默认装饰器组件。
 * @param layouts 布局组件映射表。
 * @param readPretty 预览态组件映射表。
 */
export function registerFieldComponents(
  fields: Record<string, ComponentType<any>>,
  decorator: { name: string, component: ComponentType<any> },
  layouts?: Record<string, ComponentType<any>>,
  readPretty?: Record<string, ComponentType<any>>,
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
  fields: Record<string, ComponentType<any>>,
  decorator: { name: string, component: ComponentType<any> },
  layouts?: Record<string, ComponentType<any>>,
  readPretty?: Record<string, ComponentType<any>>,
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
export function getComponent(name: string): ComponentType<any> | undefined {
  return globalRegistry.components.get(name)
}

/**
 * 从全局注册表获取装饰器。
 * @param name 装饰器名称。
 * @returns 返回装饰器组件；未注册时返回 `undefined`。
 */
export function getDecorator(name: string): ComponentType<any> | undefined {
  return globalRegistry.decorators.get(name)
}

/**
 * 从全局注册表获取操作组件。
 * @param name 操作名称。
 * @returns 返回操作组件；未注册时返回 `undefined`。
 */
export function getAction(name: string): ComponentType<any> | undefined {
  return globalRegistry.actions.get(name)
}

/**
 * 读取组件默认装饰器名称。
 * @param componentName 组件名称。
 * @returns 返回默认装饰器名称；未配置时返回 `undefined`。
 */
export function getDefaultDecorator(componentName: string): string | undefined {
  return globalRegistry.defaultDecorators.get(componentName)
}

/**
 * 读取组件的 readPretty 替代实现。
 * @param componentName 组件名称。
 * @returns 返回 readPretty 组件；未配置时返回 `undefined`。
 */
export function getReadPrettyComponent(componentName: string): ComponentType<any> | undefined {
  return globalRegistry.readPrettyComponents.get(componentName)
}

/**
 * 读取全局注册表实例。
 * @returns 返回当前全局注册表对象。
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
 * 不会写入全局注册表，适用于 SSR、多实例和单测场景。
 *
 * @param setup 注册逻辑回调，接收一组注册助手函数。
 * @returns 返回填充后的隔离注册表实例。
 */
export function createRegistry(
  setup?: (register: {
    component: (name: string, comp: ComponentType<any>, options?: RegisterComponentOptions) => void
    decorator: (name: string, decorator: ComponentType<any>) => void
    action: (name: string, action: ComponentType<any>) => void
    components: (mapping: Record<string, ComponentType<any>>, options?: RegisterComponentOptions) => void
    actions: (mapping: Record<string, ComponentType<any>>) => void
    fieldComponents: (
      fields: Record<string, ComponentType<any>>,
      decorator: { name: string, component: ComponentType<any> },
      layouts?: Record<string, ComponentType<any>>,
      readPretty?: Record<string, ComponentType<any>>,
    ) => void
  }) => void,
): RegistryState {
  const registry = createRegistryState()

  setup?.({
    /**
     * 注册单个组件到隔离注册表。
     */
    component: (name, comp, options) => registerComponentToRegistry(registry, name, comp, options),
    /**
     * 注册单个装饰器到隔离注册表。
     */
    decorator: (name, decorator) => registerDecoratorToRegistry(registry, name, decorator),
    /**
     * 注册单个操作组件到隔离注册表。
     */
    action: (name, action) => registerActionToRegistry(registry, name, action),
    /**
     * 批量注册组件到隔离注册表。
     */
    components: (mapping, options) => registerComponentsToRegistry(registry, mapping, options),
    /**
     * 批量注册操作组件到隔离注册表。
     */
    actions: mapping => registerActionsToRegistry(registry, mapping),
    /**
     * 批量注册字段组件、默认装饰器和扩展映射到隔离注册表。
     */
    fieldComponents: (fields, decorator, layouts, readPretty) =>
      registerFieldComponentsToRegistry(registry, fields, decorator, layouts, readPretty),
  })

  return registry
}

/**
 * 创建组件作用域对象。
 * 该对象可直接传给 `FormProvider` 或 `ConfigForm`，实现实例级组件隔离。
 *
 * @param setup 作用域构建回调，接收注册助手函数。
 * @returns 返回可直接注入的作用域对象。
 */
export function createComponentScope(
  setup: (register: {
    component: (name: string, comp: ComponentType<any>, options?: RegisterComponentOptions) => void
    decorator: (name: string, decorator: ComponentType<any>) => void
    action: (name: string, action: ComponentType<any>) => void
    defaultDecorator: (componentName: string, decoratorName: string) => void
    readPretty: (componentName: string, component: ComponentType<any>) => void
  }) => void,
): ComponentScope {
  const components: Record<string, ComponentType<any>> = {}
  const decorators: Record<string, ComponentType<any>> = {}
  const actions: Record<string, ComponentType<any>> = {}
  const defaultDecorators: Record<string, string> = {}
  const readPrettyComponents: Record<string, ComponentType<any>> = {}

  setup({
    /**
     * 注册作用域内组件。
     */
    component: (name, comp, options) => {
      components[name] = comp
      if (options?.defaultDecorator) {
        defaultDecorators[name] = options.defaultDecorator
      }
      if (options?.readPrettyComponent) {
        readPrettyComponents[name] = options.readPrettyComponent
      }
    },
    /**
     * 注册作用域内装饰器。
     */
    decorator: (name, decorator) => {
      decorators[name] = decorator
    },
    /**
     * 注册作用域内操作组件。
     */
    action: (name, action) => {
      actions[name] = action
    },
    /**
     * 显式设置某个组件的默认装饰器。
     */
    defaultDecorator: (componentName, decoratorName) => {
      defaultDecorators[componentName] = decoratorName
    },
    /**
     * 设置某个组件的 readPretty 替代实现。
     */
    readPretty: (componentName, component) => {
      readPrettyComponents[componentName] = component
    },
  })

  return { components, decorators, actions, defaultDecorators, readPrettyComponents }
}
