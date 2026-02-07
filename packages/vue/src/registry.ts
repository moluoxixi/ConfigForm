import type { Component } from 'vue'

/** 组件作用域（可传给 FormProvider 的 components/wrappers） */
export interface ComponentScope {
  components: Record<string, Component>
  wrappers: Record<string, Component>
}

/** 全局组件注册表 */
const globalComponents = new Map<string, Component>()
/** 全局装饰器注册表 */
const globalWrappers = new Map<string, Component>()

/**
 * 注册全局组件
 */
export function registerComponent(name: string, component: Component): void {
  globalComponents.set(name, component)
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
export function registerComponents(mapping: Record<string, Component>): void {
  for (const [name, component] of Object.entries(mapping)) {
    globalComponents.set(name, component)
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
