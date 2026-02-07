import type { Component } from 'vue'

/** 组件注册选项 */
export interface RegisterComponentOptions {
  /** 该组件的默认装饰器名称，字段未显式指定 wrapper 时自动使用 */
  defaultWrapper?: string
}

/** 组件作用域（可传给 FormProvider 的 components/wrappers） */
export interface ComponentScope {
  components: Record<string, Component>
  wrappers: Record<string, Component>
}

/** 全局组件注册表 */
const globalComponents = new Map<string, Component>()
/** 全局装饰器注册表 */
const globalWrappers = new Map<string, Component>()
/** 组件默认装饰器映射：component name → wrapper name */
const globalDefaultWrappers = new Map<string, string>()

/**
 * 注册全局组件
 *
 * @param name - 组件名称
 * @param component - Vue 组件
 * @param options - 注册选项，可指定 defaultWrapper
 */
export function registerComponent(name: string, component: Component, options?: RegisterComponentOptions): void {
  globalComponents.set(name, component)
  if (options?.defaultWrapper) {
    globalDefaultWrappers.set(name, options.defaultWrapper)
  }
}

/**
 * 注册全局装饰器
 */
export function registerWrapper(name: string, wrapper: Component): void {
  globalWrappers.set(name, wrapper)
}

/**
 * 批量注册组件
 */
export function registerComponents(mapping: Record<string, Component>, options?: RegisterComponentOptions): void {
  for (const [name, component] of Object.entries(mapping)) {
    globalComponents.set(name, component)
    if (options?.defaultWrapper) {
      globalDefaultWrappers.set(name, options.defaultWrapper)
    }
  }
}

/**
 * 批量注册字段组件 + 装饰器，所有字段组件共享同一个默认 wrapper
 *
 * UI 适配层的一站式注册方法，避免重复为每个组件指定 defaultWrapper。
 *
 * @param fields - 字段组件映射（name → Component）
 * @param wrapper - 装饰器配置
 * @param wrapper.name - 装饰器注册名
 * @param wrapper.component - 装饰器组件
 * @param layouts - 可选的布局组件映射（无默认 wrapper）
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
  wrapper: { name: string, component: Component },
  layouts?: Record<string, Component>,
): void {
  /* 注册装饰器 */
  globalWrappers.set(wrapper.name, wrapper.component)

  /* 注册字段组件，绑定默认装饰器 */
  for (const [name, component] of Object.entries(fields)) {
    globalComponents.set(name, component)
    globalDefaultWrappers.set(name, wrapper.name)
  }

  /* 注册布局组件（无默认 wrapper） */
  if (layouts) {
    for (const [name, component] of Object.entries(layouts)) {
      globalComponents.set(name, component)
    }
  }
}

/** 获取组件 */
export function getComponent(name: string): Component | undefined {
  return globalComponents.get(name)
}

/** 获取装饰器 */
export function getWrapper(name: string): Component | undefined {
  return globalWrappers.get(name)
}

/** 获取组件的默认装饰器名称 */
export function getDefaultWrapper(componentName: string): string | undefined {
  return globalDefaultWrappers.get(componentName)
}

/** 获取全局注册表 */
export function getGlobalRegistry() {
  return {
    components: globalComponents,
    wrappers: globalWrappers,
  }
}

/**
 * 创建组件作用域（不写入全局注册表）
 *
 * 用于同一页面需要使用多套 UI 库的场景，
 * 将返回值传给 `<FormProvider :components="scope.components" :wrappers="scope.wrappers">`
 * 或 `<ConfigForm :components="scope.components" :wrappers="scope.wrappers">`
 * 实现实例级隔离，避免全局注册表冲突。
 *
 * @example
 * ```ts
 * const antdScope = createComponentScope((register) => {
 *   register.component('Input', AntdInput)
 *   register.component('Select', AntdSelect)
 *   register.wrapper('FormItem', AntdFormItem)
 * })
 * ```
 */
export function createComponentScope(
  setup: (register: {
    component: (name: string, comp: Component) => void
    wrapper: (name: string, wrapper: Component) => void
  }) => void,
): ComponentScope {
  const components: Record<string, Component> = {}
  const wrappers: Record<string, Component> = {}

  setup({
    component: (name, comp) => { components[name] = comp },
    wrapper: (name, wrapper) => { wrappers[name] = wrapper },
  })

  return { components, wrappers }
}
