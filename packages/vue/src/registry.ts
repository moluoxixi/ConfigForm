import type { Component } from 'vue'

/** 组件注册选项 */
export interface RegisterComponentOptions {
  /** 该组件的默认装饰器名称，字段未显式指定 decorator 时自动使用 */
  defaultDecorator?: string
  /** 阅读态替代组件（readPretty），isPreview 时自动替换 */
  readPrettyComponent?: Component
}

/** 组件作用域（可传给 FormProvider 的 components/decorators） */
export interface ComponentScope {
  components: Record<string, Component>
  decorators: Record<string, Component>
  actions?: Record<string, Component>
  defaultDecorators?: Record<string, string>
  readPrettyComponents?: Record<string, Component>
}

/** 组件注册表（Map 结构，适合注入 FormProvider） */
export interface RegistryState {
  components: Map<string, Component>
  decorators: Map<string, Component>
  actions: Map<string, Component>
  defaultDecorators: Map<string, string>
  readPrettyComponents: Map<string, Component>
}

/** 创建一个空注册表（实例级隔离） */
export function createRegistryState(): RegistryState {
  return {
    components: new Map<string, Component>(),
    decorators: new Map<string, Component>(),
    actions: new Map<string, Component>(),
    defaultDecorators: new Map<string, string>(),
    readPrettyComponents: new Map<string, Component>(),
  }
}

const globalRegistry = createRegistryState()
const registryListeners = new WeakMap<RegistryState, Set<() => void>>()

/**
 * get Target Registry：负责“获取get Target Registry”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 get Target Registry 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
function getTargetRegistry(registry?: RegistryState): RegistryState {
  return registry ?? globalRegistry
}

/**
 * notify Registry Change：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 notify Registry Change 的单一职责，调用方可通过函数名快速理解输入输出语义。
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
 * subscribe Registry Change：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 subscribe Registry Change 的单一职责，调用方可通过函数名快速理解输入输出语义。
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
  }
}

/**
 * 注册全局组件
 *
 * @param name - 组件名称
 * @param component - Vue 组件
 * @param options - 注册选项，可指定 defaultWrapper
 */
export function registerComponent(name: string, component: Component, options?: RegisterComponentOptions): void {
  registerComponentToRegistry(getTargetRegistry(), name, component, options)
}

/** 向指定注册表注册组件（实例级） */
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
 * 注册全局装饰器
 */
export function registerDecorator(name: string, decorator: Component): void {
  registerDecoratorToRegistry(getTargetRegistry(), name, decorator)
}

/** 向指定注册表注册装饰器（实例级） */
export function registerDecoratorToRegistry(
  registry: RegistryState,
  name: string,
  decorator: Component,
): void {
  registry.decorators.set(name, decorator)
  notifyRegistryChange(registry)
}

/**
 * 注册全局 action 组件
 */
export function registerAction(name: string, action: Component): void {
  registerActionToRegistry(getTargetRegistry(), name, action)
}

/** 向指定注册表注册 action 组件（实例级） */
export function registerActionToRegistry(
  registry: RegistryState,
  name: string,
  action: Component,
): void {
  registry.actions.set(name, action)
  notifyRegistryChange(registry)
}

/**
 * 批量注册组件
 */
export function registerComponents(mapping: Record<string, Component>, options?: RegisterComponentOptions): void {
  registerComponentsToRegistry(getTargetRegistry(), mapping, options)
}

/** 向指定注册表批量注册组件（实例级） */
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
 * 批量注册 action 组件
 */
export function registerActions(mapping: Record<string, Component>): void {
  registerActionsToRegistry(getTargetRegistry(), mapping)
}

/** 向指定注册表批量注册 action 组件（实例级） */
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
 * 批量注册字段组件 + 装饰器，所有字段组件共享同一个默认 decorator
 *
 * UI 适配层的一站式注册方法，避免重复为每个组件指定 defaultWrapper。
 *
 * @param fields - 字段组件映射（name → Component）
 * @param decorator - 装饰器配置
 * @param decorator.name - 装饰器注册名
 * @param decorator.component - 装饰器组件
 * @param layouts - 可选的布局组件映射（无默认 decorator）
 *
 * @example
 * ```ts
 * registerFieldComponents(
 *   { Input, Password, Select, Switch, DatePicker },
 *   { name: 'FormItem', component: FormItem },
 *   { LayoutTabs, LayoutCard, LayoutSteps },
 * )
 * ```
 */
export function registerFieldComponents(
  fields: Record<string, Component>,
  decorator: { name: string, component: Component },
  layouts?: Record<string, Component>,
  readPretty?: Record<string, Component>,
): void {
  registerFieldComponentsToRegistry(getTargetRegistry(), fields, decorator, layouts, readPretty)
}

/** 向指定注册表批量注册字段/布局/readPretty（实例级） */
export function registerFieldComponentsToRegistry(
  registry: RegistryState,
  fields: Record<string, Component>,
  decorator: { name: string, component: Component },
  layouts?: Record<string, Component>,
  readPretty?: Record<string, Component>,
): void {
  /* 注册装饰器 */
  registry.decorators.set(decorator.name, decorator.component)

  /* 注册字段组件，绑定默认装饰器 */
  for (const [name, component] of Object.entries(fields)) {
    registry.components.set(name, component)
    registry.defaultDecorators.set(name, decorator.name)
  }

  /* 注册布局组件（无默认 decorator） */
  if (layouts) {
    for (const [name, component] of Object.entries(layouts)) {
      registry.components.set(name, component)
    }
  }

  /* 注册 readPretty 映射 */
  if (readPretty) {
    for (const [name, component] of Object.entries(readPretty)) {
      registry.readPrettyComponents.set(name, component)
    }
  }
  notifyRegistryChange(registry)
}

/** 获取组件 */
export function getComponent(name: string): Component | undefined {
  return globalRegistry.components.get(name)
}

/** 获取装饰器 */
export function getDecorator(name: string): Component | undefined {
  return globalRegistry.decorators.get(name)
}

/** 获取 action 组件 */
export function getAction(name: string): Component | undefined {
  return globalRegistry.actions.get(name)
}

/** 获取组件的默认装饰器名称 */
export function getDefaultDecorator(componentName: string): string | undefined {
  return globalRegistry.defaultDecorators.get(componentName)
}

/** 获取组件的 readPretty 替代组件 */
export function getReadPrettyComponent(componentName: string): Component | undefined {
  return globalRegistry.readPrettyComponents.get(componentName)
}

/** 获取全局注册表 */
export function getGlobalRegistry(): RegistryState {
  return globalRegistry
}

/** 清空全局注册表（测试/隔离场景使用） */
export function resetRegistry(): void {
  globalRegistry.components.clear()
  globalRegistry.decorators.clear()
  globalRegistry.actions.clear()
  globalRegistry.defaultDecorators.clear()
  globalRegistry.readPrettyComponents.clear()
  notifyRegistryChange(globalRegistry)
}

/**
 * 创建隔离注册表并通过 setup 填充（不写入全局）
 *
 * 适用于 SSR / 多租户 / 测试用例隔离场景。
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
    component: (name, comp, options) => registerComponentToRegistry(registry, name, comp, options),
    decorator: (name, dec) => registerDecoratorToRegistry(registry, name, dec),
    action: (name, action) => registerActionToRegistry(registry, name, action),
    components: (mapping, options) => registerComponentsToRegistry(registry, mapping, options),
    actions: mapping => registerActionsToRegistry(registry, mapping),
    fieldComponents: (fields, decorator, layouts, readPretty) =>
      registerFieldComponentsToRegistry(registry, fields, decorator, layouts, readPretty),
  })
  return registry
}

/**
 * 创建组件作用域（不写入全局注册表）
 *
 * 用于同一页面需要使用多套 UI 库的场景，
 * 将返回值传给 `<FormProvider :components="scope.components" :decorators="scope.decorators">`
 * 或 `<ConfigForm :components="scope.components" :decorators="scope.decorators">`
 * 实现实例级隔离，避免全局注册表冲突。
 *
 * @example
 * ```ts
 * const antdScope = createComponentScope((register) => {
 *   register.component('Input', AntdInput)
 *   register.component('Select', AntdSelect)
 *   register.decorator('FormItem', AntdFormItem)
 * })
 * ```
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
    component: (name, comp, options) => {
      components[name] = comp
      if (options?.defaultDecorator) {
        defaultDecorators[name] = options.defaultDecorator
      }
      if (options?.readPrettyComponent) {
        readPrettyComponents[name] = options.readPrettyComponent
      }
    },
    decorator: (name, dec) => { decorators[name] = dec },
    action: (name, action) => { actions[name] = action },
    defaultDecorator: (componentName, decoratorName) => {
      defaultDecorators[componentName] = decoratorName
    },
    readPretty: (componentName, component) => {
      readPrettyComponents[componentName] = component
    },
  })

  return { components, decorators, actions, defaultDecorators, readPrettyComponents }
}
