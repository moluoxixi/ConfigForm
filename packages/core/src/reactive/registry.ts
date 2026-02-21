import type { ReactiveAdapter } from './types'

type AdapterOwner = { id?: string } | string

/** 全局默认适配器（向后兼容） */
let defaultAdapter: ReactiveAdapter | null = null
/** 按表单实例 ID 隔离的适配器映射 */
const formAdapters = new Map<string, ReactiveAdapter>()

/**
 * resolve Owner Id：负责“解析resolve Owner Id”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 resolve Owner Id 的主要职责边界，便于维护者快速理解函数在链路中的定位。
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
 */
export function setReactiveAdapter(adapter: ReactiveAdapter): void {
  defaultAdapter = adapter
}

/** 为指定表单实例绑定响应式适配器（多实例/SSR 隔离） */
export function setReactiveAdapterForForm(owner: AdapterOwner, adapter: ReactiveAdapter): void {
  const id = resolveOwnerId(owner)
  if (!id) {
    throw new Error('[ConfigForm] setReactiveAdapterForForm 缺少有效的 form id。')
  }
  formAdapters.set(id, adapter)
}

/** 清除指定表单实例的适配器绑定 */
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

/** 检查是否已存在可用适配器 */
export function hasReactiveAdapter(owner?: AdapterOwner): boolean {
  const ownerId = resolveOwnerId(owner)
  if (ownerId && formAdapters.has(ownerId)) {
    return true
  }
  return defaultAdapter !== null
}

/** 重置适配器注册（仅用于测试） */
export function resetReactiveAdapter(): void {
  defaultAdapter = null
  formAdapters.clear()
}
