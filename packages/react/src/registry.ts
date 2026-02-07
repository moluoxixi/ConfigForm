import type { ComponentType } from 'react'

/** 组件注册选项 */
export interface RegisterComponentOptions {
  /** 该组件的默认装饰器名称，字段未显式指定 wrapper 时自动使用 */
  defaultWrapper?: string
  /** 阅读态替代组件（readPretty），isReadOnly 时自动替换 */
  readPrettyComponent?: ComponentType<any>
}

/** 全局组件注册表 */
const globalComponents = new Map<string, ComponentType<any>>()
/** 全局装饰器注册表 */
const globalWrappers = new Map<string, ComponentType<any>>()
/** 组件默认装饰器映射：component name → wrapper name */
const globalDefaultWrappers = new Map<string, string>()
/** 组件 readPretty 映射：component name → readPretty component */
const globalReadPretty = new Map<string, ComponentType<any>>()

/**
 * 注册全局组件
 *
 * @param name - 组件名（与 schema.component 对应）
 * @param component - React 组件
 * @param options - 注册选项，可指定 defaultWrapper
 */
export function registerComponent(name: string, component: ComponentType<any>, options?: RegisterComponentOptions): void {
  globalComponents.set(name, component)
  if (options?.defaultWrapper) {
    globalDefaultWrappers.set(name, options.defaultWrapper)
  }
  if (options?.readPrettyComponent) {
    globalReadPretty.set(name, options.readPrettyComponent)
  }
}

/**
 * 注册全局装饰器组件
 */
export function registerWrapper(name: string, wrapper: ComponentType<any>): void {
  globalWrappers.set(name, wrapper)
}

/**
 * 批量注册组件
 */
export function registerComponents(mapping: Record<string, ComponentType<any>>, options?: RegisterComponentOptions): void {
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
 * @param fields - 字段组件映射（name → Component）
 * @param wrapper - 装饰器配置
 * @param wrapper.name - 装饰器注册名
 * @param wrapper.component - 装饰器组件
 * @param layouts - 可选的布局组件映射（无默认 wrapper）
 */
export function registerFieldComponents(
  fields: Record<string, ComponentType<any>>,
  wrapper: { name: string, component: ComponentType<any> },
  layouts?: Record<string, ComponentType<any>>,
  readPretty?: Record<string, ComponentType<any>>,
): void {
  globalWrappers.set(wrapper.name, wrapper.component)
  for (const [name, component] of Object.entries(fields)) {
    globalComponents.set(name, component)
    globalDefaultWrappers.set(name, wrapper.name)
  }
  if (layouts) {
    for (const [name, component] of Object.entries(layouts)) {
      globalComponents.set(name, component)
    }
  }
  if (readPretty) {
    for (const [name, component] of Object.entries(readPretty)) {
      globalReadPretty.set(name, component)
    }
  }
}

/** 获取组件 */
export function getComponent(name: string): ComponentType<any> | undefined {
  return globalComponents.get(name)
}

/** 获取装饰器 */
export function getWrapper(name: string): ComponentType<any> | undefined {
  return globalWrappers.get(name)
}

/** 获取组件的默认装饰器名称 */
export function getDefaultWrapper(componentName: string): string | undefined {
  return globalDefaultWrappers.get(componentName)
}

/** 获取组件的 readPretty 替代组件 */
export function getReadPrettyComponent(componentName: string): ComponentType<any> | undefined {
  return globalReadPretty.get(componentName)
}

/** 获取全局注册表 */
export function getGlobalRegistry() {
  return {
    components: globalComponents,
    wrappers: globalWrappers,
  }
}
