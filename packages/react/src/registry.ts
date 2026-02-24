import type { ComponentType } from 'react'

/**
 * notifyRegistryChange：执行当前功能逻辑。
 *
 * @param registry 参数 registry 的输入说明。
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
 * subscribe Registry Change：当前功能模块的核心执行单元。
 * 所属模块：`packages/react/src/registry.ts`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param registry 参数 `registry`用于提供当前函数执行所需的输入信息。
 * @param listener 参数 `listener`用于提供集合数据，支撑批量遍历与扩展处理。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
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
 * @param name - 组件名（与 schema.component 对应）
 * @param component - React 组件
 * @param options - 注册选项，可指定 defaultWrapper
 */
export function registerComponent(name: string, component: ComponentType<any>, options?: RegisterComponentOptions): void {
  registerComponentToRegistry(getTargetRegistry(), name, component, options)
}

/**
 * 向指定注册表注册组件（实例级）
 * @param registry 参数 `registry`用于提供当前函数执行所需的输入信息。
 * @param name 参数 `name`用于提供当前函数执行所需的输入信息。
 * @param component 参数 `component`用于提供当前函数执行所需的输入信息。
 * @param [options] 参数 `options`用于提供可选配置，调整当前功能模块的执行策略。
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
 * 注册全局装饰器组件
 * @param name 参数 `name`用于提供当前函数执行所需的输入信息。
 * @param decorator 参数 `decorator`用于提供当前函数执行所需的输入信息。
 */
export function registerDecorator(name: string, decorator: ComponentType<any>): void {
  registerDecoratorToRegistry(getTargetRegistry(), name, decorator)
}

/**
 * 向指定注册表注册装饰器（实例级）
 * @param registry 参数 `registry`用于提供当前函数执行所需的输入信息。
 * @param name 参数 `name`用于提供当前函数执行所需的输入信息。
 * @param decorator 参数 `decorator`用于提供当前函数执行所需的输入信息。
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
 * 注册全局 action 组件
 * @param name 参数 `name`用于提供当前函数执行所需的输入信息。
 * @param action 参数 `action`用于提供当前函数执行所需的输入信息。
 */
export function registerAction(name: string, action: ComponentType<any>): void {
  registerActionToRegistry(getTargetRegistry(), name, action)
}

/**
 * 向指定注册表注册 action 组件（实例级）
 * @param registry 参数 `registry`用于提供当前函数执行所需的输入信息。
 * @param name 参数 `name`用于提供当前函数执行所需的输入信息。
 * @param action 参数 `action`用于提供当前函数执行所需的输入信息。
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
 * 批量注册组件
 * @param mapping 参数 `mapping`用于提供当前函数执行所需的输入信息。
 * @param [options] 参数 `options`用于提供可选配置，调整当前功能模块的执行策略。
 */
export function registerComponents(mapping: Record<string, ComponentType<any>>, options?: RegisterComponentOptions): void {
  registerComponentsToRegistry(getTargetRegistry(), mapping, options)
}

/**
 * 向指定注册表批量注册组件（实例级）
 * @param registry 参数 `registry`用于提供当前函数执行所需的输入信息。
 * @param mapping 参数 `mapping`用于提供当前函数执行所需的输入信息。
 * @param [options] 参数 `options`用于提供可选配置，调整当前功能模块的执行策略。
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
 * 批量注册 action 组件
 * @param mapping 参数 `mapping`用于提供当前函数执行所需的输入信息。
 */
export function registerActions(mapping: Record<string, ComponentType<any>>): void {
  registerActionsToRegistry(getTargetRegistry(), mapping)
}

/**
 * 向指定注册表批量注册 action 组件（实例级）
 * @param registry 参数 `registry`用于提供当前函数执行所需的输入信息。
 * @param mapping 参数 `mapping`用于提供当前函数执行所需的输入信息。
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
 * 批量注册字段组件 + 装饰器，所有字段组件共享同一个默认 decorator
 *
 * @param fields - 字段组件映射（name → Component）
 * @param decorator - 装饰器配置
 * @param decorator.name - 装饰器注册名
 * @param decorator.component - 装饰器组件
 * @param layouts - 可选的布局组件映射（无默认 decorator）
 * @param [readPretty] 参数 `readPretty`用于提供当前函数执行所需的输入信息。
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
 * 向指定注册表批量注册字段/布局/readPretty（实例级）
 * @param registry 参数 `registry`用于提供当前函数执行所需的输入信息。
 * @param fields 参数 `fields`用于提供当前函数执行所需的输入信息。
 * @param decorator 参数 `decorator`用于提供当前函数执行所需的输入信息。
 * @param [layouts] 参数 `layouts`用于提供当前函数执行所需的输入信息。
 * @param [readPretty] 参数 `readPretty`用于提供当前函数执行所需的输入信息。
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
 * 获取组件
 * @param name 参数 `name`用于提供当前函数执行所需的输入信息。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
 */
export function getComponent(name: string): ComponentType<any> | undefined {
  return globalRegistry.components.get(name)
}

/**
 * 获取装饰器
 * @param name 参数 `name`用于提供当前函数执行所需的输入信息。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
 */
export function getDecorator(name: string): ComponentType<any> | undefined {
  return globalRegistry.decorators.get(name)
}

/**
 * 获取 action 组件
 * @param name 参数 `name`用于提供当前函数执行所需的输入信息。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
 */
export function getAction(name: string): ComponentType<any> | undefined {
  return globalRegistry.actions.get(name)
}

/**
 * 获取组件的默认装饰器名称
 * @param componentName 参数 `componentName`用于提供当前函数执行所需的输入信息。
 * @returns 返回字符串结果，通常用于文本展示或下游拼接。
 */
export function getDefaultDecorator(componentName: string): string | undefined {
  return globalRegistry.defaultDecorators.get(componentName)
}

/**
 * 获取组件的 readPretty 替代组件
 * @param componentName 参数 `componentName`用于提供当前函数执行所需的输入信息。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
 */
export function getReadPrettyComponent(componentName: string): ComponentType<any> | undefined {
  return globalRegistry.readPrettyComponents.get(componentName)
}

/**
 * 获取全局注册表
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
 */
export function getGlobalRegistry(): RegistryState {
  return globalRegistry
}

/**
 * 清空全局注册表（测试/隔离场景使用）
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
 * 创建隔离注册表并通过 setup 填充（不写入全局）
 *
 * 适用于 SSR / 多租户 / 测试用例隔离场景。
 * @param [setup] 参数 `setup`用于提供当前函数执行所需的输入信息。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
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
     * component：执行当前功能逻辑。
     *
     * @param name 参数 name 的输入说明。
     * @param comp 参数 comp 的输入说明。
     * @param options 参数 options 的输入说明。
     *
     * @returns 返回当前功能的处理结果。
     */

    component: (name, comp, options) => registerComponentToRegistry(registry, name, comp, options),
    /**
     * decorator：执行当前功能逻辑。
     *
     * @param name 参数 name 的输入说明。
     * @param dec 参数 dec 的输入说明。
     *
     * @returns 返回当前功能的处理结果。
     */

    decorator: (name, dec) => registerDecoratorToRegistry(registry, name, dec),
    /**
     * action：执行当前功能逻辑。
     *
     * @param name 参数 name 的输入说明。
     * @param action 参数 action 的输入说明。
     *
     * @returns 返回当前功能的处理结果。
     */

    action: (name, action) => registerActionToRegistry(registry, name, action),
    /**
     * components：执行当前功能逻辑。
     *
     * @param mapping 参数 mapping 的输入说明。
     * @param options 参数 options 的输入说明。
     *
     * @returns 返回当前功能的处理结果。
     */

    components: (mapping, options) => registerComponentsToRegistry(registry, mapping, options),
    /**
     * actions：执行当前功能逻辑。
     *
     * @param mapping 参数 mapping 的输入说明。
     *
     * @returns 返回当前功能的处理结果。
     */

    actions: mapping => registerActionsToRegistry(registry, mapping),
    /**
     * fieldComponents：执行当前功能逻辑。
     *
     * @param fields 参数 fields 的输入说明。
     * @param decorator 参数 decorator 的输入说明。
     * @param layouts 参数 layouts 的输入说明。
     * @param readPretty 参数 readPretty 的输入说明。
     *
     * @returns 返回当前功能的处理结果。
     */

    fieldComponents: (fields, decorator, layouts, readPretty) =>
      registerFieldComponentsToRegistry(registry, fields, decorator, layouts, readPretty),
  })
  return registry
}

/**
 * 创建组件作用域（不写入全局注册表）
 *
 * 用于同一页面需要使用多套 UI 组件映射时，
 * 将返回值传给 `<FormProvider components={scope.components} decorators={scope.decorators}>`
 * 或 `<ConfigForm components={scope.components} decorators={scope.decorators}>`
 * 实现实例级隔离，避免全局注册表冲突。
 * @param setup 参数 `setup`用于提供当前函数执行所需的输入信息。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
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
     * component：执行当前功能逻辑。
     *
     * @param name 参数 name 的输入说明。
     * @param comp 参数 comp 的输入说明。
     * @param options 参数 options 的输入说明。
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
     * decorator：执行当前功能逻辑。
     *
     * @param name 参数 name 的输入说明。
     * @param dec 参数 dec 的输入说明。
     */

    decorator: (name, dec) => { decorators[name] = dec },
    /**
     * action：执行当前功能逻辑。
     *
     * @param name 参数 name 的输入说明。
     * @param action 参数 action 的输入说明。
     */

    action: (name, action) => { actions[name] = action },
    /**
     * defaultDecorator：执行当前功能逻辑。
     *
     * @param componentName 参数 componentName 的输入说明。
     * @param decoratorName 参数 decoratorName 的输入说明。
     */

    defaultDecorator: (componentName, decoratorName) => {
      defaultDecorators[componentName] = decoratorName
    },
    /**
     * readPretty：执行当前功能逻辑。
     *
     * @param componentName 参数 componentName 的输入说明。
     * @param component 参数 component 的输入说明。
     */

    readPretty: (componentName, component) => {
      readPrettyComponents[componentName] = component
    },
  })

  return { components, decorators, actions, defaultDecorators, readPrettyComponents }
}
