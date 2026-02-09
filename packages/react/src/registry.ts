import type { ComponentType } from 'react'

/** 组件注册选项 */
export interface RegisterComponentOptions {
  /** 该组件的默认装饰器名称，字段未显式指定 decorator 时自动使用 */
  defaultDecorator?: string
  /** 阅读态替代组件（readPretty），isPreview 时自动替换 */
  readPrettyComponent?: ComponentType<any>
}

/** 全局组件注册表 */
const globalComponents = new Map<string, ComponentType<any>>()
/** 全局装饰器注册表 */
const globalDecorators = new Map<string, ComponentType<any>>()
/** 组件默认装饰器映射：component name → decorator name */
const globalDefaultDecorators = new Map<string, string>()
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
  if (options?.defaultDecorator) {
    globalDefaultDecorators.set(name, options.defaultDecorator)
  }
  if (options?.readPrettyComponent) {
    globalReadPretty.set(name, options.readPrettyComponent)
  }
}

/**
 * 注册全局装饰器组件
 */
export function registerDecorator(name: string, decorator: ComponentType<any>): void {
  globalDecorators.set(name, decorator)
}

/**
 * 批量注册组件
 */
export function registerComponents(mapping: Record<string, ComponentType<any>>, options?: RegisterComponentOptions): void {
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
 * @param fields - 字段组件映射（name → Component）
 * @param decorator - 装饰器配置
 * @param decorator.name - 装饰器注册名
 * @param decorator.component - 装饰器组件
 * @param layouts - 可选的布局组件映射（无默认 decorator）
 */
export function registerFieldComponents(
  fields: Record<string, ComponentType<any>>,
  decorator: { name: string, component: ComponentType<any> },
  layouts?: Record<string, ComponentType<any>>,
  readPretty?: Record<string, ComponentType<any>>,
): void {
  globalDecorators.set(decorator.name, decorator.component)
  for (const [name, component] of Object.entries(fields)) {
    globalComponents.set(name, component)
    globalDefaultDecorators.set(name, decorator.name)
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
export function getDecorator(name: string): ComponentType<any> | undefined {
  return globalDecorators.get(name)
}

/** 获取组件的默认装饰器名称 */
export function getDefaultDecorator(componentName: string): string | undefined {
  return globalDefaultDecorators.get(componentName)
}

/** 获取组件的 readPretty 替代组件 */
export function getReadPrettyComponent(componentName: string): ComponentType<any> | undefined {
  return globalReadPretty.get(componentName)
}

/** 获取全局注册表 */
export function getGlobalRegistry() {
  return {
    components: globalComponents,
    decorators: globalDecorators,
  }
}
