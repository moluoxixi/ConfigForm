import type { FormGraph, FormInstance, FormPlugin, PluginContext, PluginInstallResult } from '@moluoxixi/core'
import type { Disposer } from '@moluoxixi/shared'
import { FormLifeCycle } from '@moluoxixi/core'
import { debounce } from '@moluoxixi/shared'

/**
 * 存储适配器接口
 *
 * 抽象存储层，支持不同的持久化方案：
 * - localStorage / sessionStorage
 * - IndexedDB
 * - 远程存储（API）
 */
export interface DraftStorageAdapter {
  /** 获取草稿 */
  get(key: string): Promise<FormGraph | null>
  /** 保存草稿 */
  set(key: string, graph: FormGraph): Promise<void>
  /** 删除草稿 */
  remove(key: string): Promise<void>
  /** 检查是否存在草稿 */
  has(key: string): Promise<boolean>
}

/** 插件配置 */
export interface DraftPluginConfig {
  /** 草稿存储 key（唯一标识，如表单名或路由路径） */
  key: string
  /** 存储适配器（默认 localStorage） */
  storage?: DraftStorageAdapter
  /** 自动保存防抖间隔（ms，默认 2000） */
  debounceMs?: number
  /** 是否监听 beforeunload 事件（页面关闭前保存，默认 true） */
  saveOnUnload?: boolean
  /** 草稿最大存活时间（ms，默认 24h）。为 0 表示永不过期 */
  maxAge?: number
  /** 保存成功回调 */
  onSave?: (graph: FormGraph) => void
  /** 恢复成功回调 */
  onRestore?: (graph: FormGraph) => void
  /** 错误回调 */
  onError?: (error: Error) => void
}

/** 插件暴露的 API */
export interface DraftPluginAPI {
  /** 手动保存草稿 */
  save: () => Promise<void>
  /** 恢复草稿 */
  restore: () => Promise<boolean>
  /** 检查是否存在草稿 */
  hasDraft: () => Promise<boolean>
  /** 丢弃草稿 */
  discard: () => Promise<void>
}

/** 默认自动保存间隔 */
const DEFAULT_DEBOUNCE_MS = 2000
/** 默认草稿存活时间：24小时 */
const DEFAULT_MAX_AGE = 24 * 60 * 60 * 1000
/** localStorage key 前缀 */
const STORAGE_PREFIX = 'configform:draft:'

/** 插件名称 */
export const PLUGIN_NAME = 'draft'

/**
 * localStorage 存储适配器
 */
export class LocalStorageAdapter implements DraftStorageAdapter {
  async get(key: string): Promise<FormGraph | null> {
    try {
      const raw = localStorage.getItem(STORAGE_PREFIX + key)
      if (!raw) return null
      return JSON.parse(raw) as FormGraph
    }
    catch { return null }
  }

  async set(key: string, graph: FormGraph): Promise<void> {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(graph))
    }
    catch (err) {
      throw new Error(`草稿保存失败: ${(err as Error).message}`)
    }
  }

  async remove(key: string): Promise<void> {
    localStorage.removeItem(STORAGE_PREFIX + key)
  }

  async has(key: string): Promise<boolean> {
    return localStorage.getItem(STORAGE_PREFIX + key) !== null
  }
}

/**
 * sessionStorage 存储适配器
 */
export class SessionStorageAdapter implements DraftStorageAdapter {
  async get(key: string): Promise<FormGraph | null> {
    try {
      const raw = sessionStorage.getItem(STORAGE_PREFIX + key)
      if (!raw) return null
      return JSON.parse(raw) as FormGraph
    }
    catch { return null }
  }

  async set(key: string, graph: FormGraph): Promise<void> {
    try {
      sessionStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(graph))
    }
    catch (err) {
      throw new Error(`草稿保存失败: ${(err as Error).message}`)
    }
  }

  async remove(key: string): Promise<void> {
    sessionStorage.removeItem(STORAGE_PREFIX + key)
  }

  async has(key: string): Promise<boolean> {
    return sessionStorage.getItem(STORAGE_PREFIX + key) !== null
  }
}

/**
 * 草稿自动保存插件
 *
 * 自动保存表单状态到持久化存储，支持恢复草稿和手动管理。
 *
 * @param config - 插件配置（key 必填）
 * @returns FormPlugin 实例
 *
 * @example
 * ```ts
 * import { createForm } from '@moluoxixi/core'
 * import { draftPlugin, type DraftPluginAPI } from '@moluoxixi/plugin-draft'
 *
 * const form = createForm({
 *   initialValues: { name: '' },
 *   plugins: [draftPlugin({ key: 'user-form', debounceMs: 3000 })],
 * })
 *
 * const draft = form.getPlugin<DraftPluginAPI>('draft')!
 * await draft.restore()
 * // ... 用户填写表单 ...
 * await draft.discard() // 提交成功后清除
 * ```
 */
export function draftPlugin(config: DraftPluginConfig): FormPlugin<DraftPluginAPI> {
  return {
    name: PLUGIN_NAME,
    install(form: FormInstance, _context: PluginContext): PluginInstallResult<DraftPluginAPI> {
      const storage = config.storage ?? new LocalStorageAdapter()
      const key = config.key
      const maxAge = config.maxAge ?? DEFAULT_MAX_AGE
      const disposers: Disposer[] = []

      /** 保存草稿核心逻辑 */
      async function doSave(): Promise<void> {
        try {
          const graph = form.getGraph()
          await storage.set(key, graph)
          config.onSave?.(graph)
        }
        catch (err) {
          config.onError?.(err as Error)
          throw err
        }
      }

      /** 检查草稿是否过期 */
      function isExpired(graph: FormGraph): boolean {
        if (maxAge <= 0 || !graph.timestamp) return false
        return Date.now() - graph.timestamp > maxAge
      }

      /* 创建防抖保存函数 */
      const debouncedSave = debounce(() => {
        doSave().catch((err) => {
          config.onError?.(err as Error)
        })
      }, config.debounceMs ?? DEFAULT_DEBOUNCE_MS)

      /* 监听值变化自动保存 */
      const valuesDisposer = form.on(FormLifeCycle.ON_FORM_VALUES_CHANGE, () => {
        debouncedSave()
      })
      disposers.push(valuesDisposer)

      /* 页面关闭前保存 */
      let unloadHandler: (() => void) | null = null
      if (config.saveOnUnload !== false && typeof window !== 'undefined') {
        unloadHandler = (): void => {
          try {
            const graph = form.getGraph()
            localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(graph))
          }
          catch { /* 忽略 */ }
        }
        window.addEventListener('beforeunload', unloadHandler)
      }

      const api: DraftPluginAPI = {
        save: () => doSave(),

        async restore(): Promise<boolean> {
          try {
            const graph = await storage.get(key)
            if (!graph) return false
            if (isExpired(graph)) {
              await storage.remove(key)
              return false
            }
            form.setGraph(graph)
            config.onRestore?.(graph)
            return true
          }
          catch (err) {
            config.onError?.(err as Error)
            return false
          }
        },

        async hasDraft(): Promise<boolean> {
          try {
            const graph = await storage.get(key)
            if (!graph) return false
            if (isExpired(graph)) {
              await storage.remove(key)
              return false
            }
            return true
          }
          catch { return false }
        },

        async discard(): Promise<void> {
          try { await storage.remove(key) }
          catch (err) { config.onError?.(err as Error) }
        },
      }

      return {
        api,
        dispose(): void {
          if ('cancel' in debouncedSave) {
            (debouncedSave as { cancel: () => void }).cancel()
          }
          for (const disposer of disposers) {
            disposer()
          }
          if (unloadHandler && typeof window !== 'undefined') {
            window.removeEventListener('beforeunload', unloadHandler)
          }
        },
      }
    },
  }
}
