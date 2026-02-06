import type { ComponentType } from 'react'

/** 全局组件注册表 */
const globalComponents = new Map<string, ComponentType<any>>()
/** 全局装饰器注册表 */
const globalWrappers = new Map<string, ComponentType<any>>()

/**
 * 注册全局组件
 * @param name - 组件名（与 schema.component 对应）
 * @param component - React 组件
 */
export function registerComponent(name: string, component: ComponentType<any>): void {
  globalComponents.set(name, component)
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
export function registerComponents(mapping: Record<string, ComponentType<any>>): void {
  for (const [name, component] of Object.entries(mapping)) {
    globalComponents.set(name, component)
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

/** 获取全局注册表 */
export function getGlobalRegistry() {
  return {
    components: globalComponents,
    wrappers: globalWrappers,
  }
}
