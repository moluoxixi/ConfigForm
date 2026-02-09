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
}

/** 全局组件注册表 */
const globalComponents = new Map<string, Component>()
/** 全局装饰器注册表 */
const globalDecorators = new Map<string, Component>()
/** 组件默认装饰器映射：component name → decorator name */
const globalDefaultDecorators = new Map<string, string>()
/** 组件 readPretty 映射：component name → readPretty component */
const globalReadPretty = new Map<string, Component>()

/**
 * 注册全局组件
 *
 * @param name - 组件名称
 * @param component - Vue 组件
 * @param options - 注册选项，可指定 defaultWrapper
 */
export function registerComponent(name: string, component: Component, options?: RegisterComponentOptions): void {
  globalComponents.set(name, component)
  if (options?.defaultDecorator) {
    globalDefaultDecorators.set(name, options.defaultDecorator)
  }
  if (options?.readPrettyComponent) {
    globalReadPretty.set(name, options.readPrettyComponent)
  }
}

/**
 * 注册全局装饰器
 */
export function registerDecorator(name: string, decorator: Component): void {
  globalDecorators.set(name, decorator)
}

/**
 * 批量注册组件
 */
export function registerComponents(mapping: Record<string, Component>, options?: RegisterComponentOptions): void {
  for (const [name, component] of Object.entries(mapping)) {
    globalComponents.set(name, component)
    if (options?.defaultDecorator) {
      globalDefaultDecorators.set(name, options.defaultDecorator)
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
  /* 注册装饰器 */
  globalDecorators.set(decorator.name, decorator.component)

  /* 注册字段组件，绑定默认装饰器 */
  for (const [name, component] of Object.entries(fields)) {
    globalComponents.set(name, component)
    globalDefaultDecorators.set(name, decorator.name)
  }

  /* 注册布局组件（无默认 decorator） */
  if (layouts) {
    for (const [name, component] of Object.entries(layouts)) {
      globalComponents.set(name, component)
    }
  }

  /* 注册 readPretty 映射 */
  if (readPretty) {
    for (const [name, component] of Object.entries(readPretty)) {
      globalReadPretty.set(name, component)
    }
  }
}

/** 获取组件 */
export function getComponent(name: string): Component | undefined {
  return globalComponents.get(name)
}

/** 获取装饰器 */
export function getDecorator(name: string): Component | undefined {
  return globalDecorators.get(name)
}

/** 获取组件的默认装饰器名称 */
export function getDefaultDecorator(componentName: string): string | undefined {
  return globalDefaultDecorators.get(componentName)
}

/** 获取组件的 readPretty 替代组件 */
export function getReadPrettyComponent(componentName: string): Component | undefined {
  return globalReadPretty.get(componentName)
}

/** 获取全局注册表 */
export function getGlobalRegistry() {
  return {
    components: globalComponents,
    decorators: globalDecorators,
  }
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
    component: (name: string, comp: Component) => void
    decorator: (name: string, decorator: Component) => void
  }) => void,
): ComponentScope {
  const components: Record<string, Component> = {}
  const decorators: Record<string, Component> = {}

  setup({
    component: (name, comp) => { components[name] = comp },
    decorator: (name, dec) => { decorators[name] = dec },
  })

  return { components, decorators }
}
