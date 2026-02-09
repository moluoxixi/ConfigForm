import type { ReactiveAdapter } from './types'

/** 当前激活的适配器 */
let currentAdapter: ReactiveAdapter | null = null

/**
 * 设置全局响应式适配器
 *
 * 在应用初始化时调用一次：
 * - React 项目：setReactiveAdapter(mobxAdapter)
 * - Vue 项目：setReactiveAdapter(vueAdapter)
 */
export function setReactiveAdapter(adapter: ReactiveAdapter): void {
  currentAdapter = adapter
}

/**
 * 获取当前响应式适配器
 * @throws 如果未设置适配器则抛出错误
 */
export function getReactiveAdapter(): ReactiveAdapter {
  if (!currentAdapter) {
    throw new Error(
      '[ConfigForm] 未设置响应式适配器。请在应用初始化时调用 setReactiveAdapter()。\n'
      + '  React 项目: import { mobxAdapter } from "@moluoxixi/reactive-react"\n'
      + '  Vue 项目:   import { vueAdapter } from "@moluoxixi/reactive-vue"',
    )
  }
  return currentAdapter
}

/**
 * 检查是否已设置适配器
 */
export function hasReactiveAdapter(): boolean {
  return currentAdapter !== null
}

/**
 * 重置适配器（仅用于测试）
 */
export function resetReactiveAdapter(): void {
  currentAdapter = null
}
