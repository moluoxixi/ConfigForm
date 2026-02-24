import type { ReactiveAdapter } from './types'

/**
 * 适配器归属标识。
 * 支持直接传表单 id 字符串，或传入带 id 的对象（如 Form 实例）。
 */
type AdapterOwner = { id?: string } | string

/** 全局默认适配器（向后兼容） */
let defaultAdapter: ReactiveAdapter | null = null
/** 按表单实例 ID 隔离的适配器映射 */
const formAdapters = new Map<string, ReactiveAdapter>()

/**
 * 从 owner 入参中提取可用的表单 id。
 * @param owner 适配器归属信息。
 * @returns 可用 id；当 owner 不存在或没有 id 时返回 undefined。
 */
function resolveOwnerId(owner?: AdapterOwner | null): string | undefined {
  if (!owner) {
    return undefined
  }
  if (typeof owner === 'string') {
    return owner
  }
  return owner.id
}

/**
 * 设置全局默认响应式适配器
 *
 * 在应用初始化时调用一次：
 * - React 项目：setReactiveAdapter(mobxAdapter)
 * - Vue 项目：setReactiveAdapter(vueAdapter)
 * @param adapter 要注册的默认响应式适配器。
 */
export function setReactiveAdapter(adapter: ReactiveAdapter): void {
  defaultAdapter = adapter
}

/**
 * 为指定表单实例绑定响应式适配器（多实例/SSR 隔离）
 * @param owner 绑定目标（表单 id 或带 id 的对象）。
 * @param adapter 要绑定的响应式适配器。
 */
export function setReactiveAdapterForForm(owner: AdapterOwner, adapter: ReactiveAdapter): void {
  const id = resolveOwnerId(owner)
  if (!id) {
    throw new Error('[ConfigForm] setReactiveAdapterForForm 缺少有效的 form id。')
  }
  formAdapters.set(id, adapter)
}

/**
 * 清除指定表单实例的适配器绑定
 * @param owner 绑定目标（表单 id 或带 id 的对象）。
 */
export function clearReactiveAdapterForForm(owner: AdapterOwner): void {
  const id = resolveOwnerId(owner)
  if (!id) {
    return
  }
  formAdapters.delete(id)
}

/**
 * 获取响应式适配器
 *
 * 查找顺序：
 * 1. owner 对应的实例级适配器
 * 2. 全局默认适配器
 * @param owner 可选归属信息；传入时优先查实例级适配器。
 * @returns 可用的响应式适配器实例。
 */
export function getReactiveAdapter(owner?: AdapterOwner): ReactiveAdapter {
  const ownerId = resolveOwnerId(owner)
  if (ownerId) {
    const scoped = formAdapters.get(ownerId)
    if (scoped) {
      return scoped
    }
  }

  if (defaultAdapter) {
    return defaultAdapter
  }

  throw new Error(
    '[ConfigForm] 未设置响应式适配器。请在应用初始化时调用 setReactiveAdapter()。\n'
    + '  React 项目: import { mobxAdapter } from "@moluoxixi/reactive-react"\n'
    + '  Vue 项目:   import { vueAdapter } from "@moluoxixi/reactive-vue"',
  )
}

/**
 * 检查是否已存在可用适配器
 * @param owner 可选归属信息。
 * @returns 当存在实例级或全局默认适配器时返回 true。
 */
export function hasReactiveAdapter(owner?: AdapterOwner): boolean {
  const ownerId = resolveOwnerId(owner)
  if (ownerId && formAdapters.has(ownerId)) {
    return true
  }
  return defaultAdapter !== null
}

/**
 * 重置适配器注册（仅用于测试）
 */
export function resetReactiveAdapter(): void {
  defaultAdapter = null
  formAdapters.clear()
}
