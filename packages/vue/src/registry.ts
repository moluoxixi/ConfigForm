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
  defaultDecorators?: Record<string, string>
  readPrettyComponents?: Record<string, Component>
}

/** 组件注册表（Map 结构，适合注入 FormProvider） */
export interface RegistryState {
  components: Map<string, Component>
  decorators: Map<string, Component>
  defaultDecorators: Map<string, string>
  readPrettyComponents: Map<string, Component>
}

/** 创建一个空注册表（实例级隔离） */
export function createRegistryState(): RegistryState {
  return {
    components: new Map<string, Component>(),
    decorators: new Map<string, Component>(),
    defaultDecorators: new Map<string, string>(),
    readPrettyComponents: new Map<string, Component>(),
  }
}

const globalRegistry = createRegistryState()

function getTargetRegistry(registry?: RegistryState): RegistryState {
  return registry ?? globalRegistry
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
}

/** 获取组件 */
export function getComponent(name: string): Component | undefined {
  return globalRegistry.components.get(name)
}

/** 获取装饰器 */
export function getDecorator(name: string): Component | undefined {
  return globalRegistry.decorators.get(name)
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
  globalRegistry.defaultDecorators.clear()
  globalRegistry.readPrettyComponents.clear()
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
    components: (mapping: Record<string, Component>, options?: RegisterComponentOptions) => void
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
    components: (mapping, options) => registerComponentsToRegistry(registry, mapping, options),
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
    defaultDecorator: (componentName: string, decoratorName: string) => void
    readPretty: (componentName: string, component: Component) => void
  }) => void,
): ComponentScope {
  const components: Record<string, Component> = {}
  const decorators: Record<string, Component> = {}
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
    defaultDecorator: (componentName, decoratorName) => {
      defaultDecorators[componentName] = decoratorName
    },
    readPretty: (componentName, component) => {
      readPrettyComponents[componentName] = component
    },
  })

  return { components, decorators, defaultDecorators, readPrettyComponents }
}
