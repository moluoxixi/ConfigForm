import type { Component } from 'vue';

/** 全局组件注册表 */
const globalComponents = new Map<string, Component>();
/** 全局装饰器注册表 */
const globalWrappers = new Map<string, Component>();

/**
 * 注册全局组件
 */
export function registerComponent(name: string, component: Component): void {
  globalComponents.set(name, component);
}

/**
 * 注册全局装饰器
 */
export function registerWrapper(name: string, wrapper: Component): void {
  globalWrappers.set(name, wrapper);
}

/**
 * 批量注册组件
 */
export function registerComponents(mapping: Record<string, Component>): void {
  for (const [name, component] of Object.entries(mapping)) {
    globalComponents.set(name, component);
  }
}

/** 获取组件 */
export function getComponent(name: string): Component | undefined {
  return globalComponents.get(name);
}

/** 获取装饰器 */
export function getWrapper(name: string): Component | undefined {
  return globalWrappers.get(name);
}

/** 获取全局注册表 */
export function getGlobalRegistry() {
  return {
    components: globalComponents,
    wrappers: globalWrappers,
  };
}
