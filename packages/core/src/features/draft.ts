import type { Disposer } from '@moluoxixi/shared'
import type { FormGraph, FormInstance } from '../types'
import { debounce } from '@moluoxixi/shared'
import { FormLifeCycle } from '../events'

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

/** 草稿管理器配置 */
export interface DraftConfig {
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

/** 默认自动保存间隔 */
const DEFAULT_DEBOUNCE_MS = 2000
/** 默认草稿存活时间：24小时 */
const DEFAULT_MAX_AGE = 24 * 60 * 60 * 1000
/** localStorage key 前缀 */
const STORAGE_PREFIX = 'configform:draft:'

/**
 * localStorage 存储适配器
 *
 * 最简单的持久化方案，适用于单页应用的表单草稿保存。
 * 数据存储在浏览器 localStorage 中，跨标签页共享。
 */
export class LocalStorageAdapter implements DraftStorageAdapter {
  async get(key: string): Promise<FormGraph | null> {
    try {
      const raw = localStorage.getItem(STORAGE_PREFIX + key)
      if (!raw) return null
      return JSON.parse(raw) as FormGraph
    }
    catch {
      return null
    }
  }

  async set(key: string, graph: FormGraph): Promise<void> {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(graph))
    }
    catch (err) {
      /* localStorage 满了或被禁用 */
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
 *
 * 会话级存储，关闭标签页后自动清除。
 * 适用于不需要跨会话保留的临时草稿。
 */
export class SessionStorageAdapter implements DraftStorageAdapter {
  async get(key: string): Promise<FormGraph | null> {
    try {
      const raw = sessionStorage.getItem(STORAGE_PREFIX + key)
      if (!raw) return null
      return JSON.parse(raw) as FormGraph
    }
    catch {
      return null
    }
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
 * 表单草稿管理器
 *
 * 自动保存表单状态到持久化存储，支持恢复草稿和手动管理。
 *
 * 核心功能：
 * - 自动防抖保存（监听 form.values 变化）
 * - 页面关闭前自动保存（beforeunload）
 * - 草稿过期自动清理
 * - 可插拔存储适配器
 *
 * @example
 * ```ts
 * const form = createForm({ initialValues: { name: '' } })
 * const draft = new FormDraftManager(form, {
 *   key: 'user-form',
 *   debounceMs: 3000,
 * })
 *
 * // 检查并恢复草稿
 * const hasDraft = await draft.restore()
 * if (hasDraft) {
 *   console.log('已恢复草稿')
 * }
 *
 * // 提交成功后清除草稿
 * await form.submit()
 * await draft.discard()
 *
 * // 组件卸载时销毁
 * draft.dispose()
 * ```
 */
export class FormDraftManager {
  private form: FormInstance
  private storage: DraftStorageAdapter
  private key: string
  private maxAge: number
  private disposers: Disposer[] = []
  private debouncedSave: ReturnType<typeof debounce>
  private onSave?: DraftConfig['onSave']
  private onRestore?: DraftConfig['onRestore']
  private onError?: DraftConfig['onError']
  private _unloadHandler: (() => void) | null = null

  constructor(form: FormInstance, config: DraftConfig) {
    this.form = form
    this.key = config.key
    this.storage = config.storage ?? new LocalStorageAdapter()
    this.maxAge = config.maxAge ?? DEFAULT_MAX_AGE
    this.onSave = config.onSave
    this.onRestore = config.onRestore
    this.onError = config.onError

    /* 创建防抖保存函数 */
    this.debouncedSave = debounce(() => {
      this.save().catch((err) => {
        this.onError?.(err as Error)
      })
    }, config.debounceMs ?? DEFAULT_DEBOUNCE_MS)

    /* 监听值变化自动保存 */
    const valuesDisposer = form.on(FormLifeCycle.ON_FORM_VALUES_CHANGE, () => {
      this.debouncedSave()
    })
    this.disposers.push(valuesDisposer)

    /* 页面关闭前保存 */
    if (config.saveOnUnload !== false && typeof window !== 'undefined') {
      this._unloadHandler = (): void => {
        /* beforeunload 中使用同步 localStorage 直接写入 */
        try {
          const graph = form.getGraph()
          localStorage.setItem(STORAGE_PREFIX + this.key, JSON.stringify(graph))
        }
        catch { /* 忽略 */ }
      }
      window.addEventListener('beforeunload', this._unloadHandler)
    }
  }

  /**
   * 手动保存草稿
   *
   * 立即保存当前表单状态到存储。
   * 通常不需要手动调用（自动保存已覆盖），但可用于关键操作节点的显式保存。
   */
  async save(): Promise<void> {
    try {
      const graph = this.form.getGraph()
      await this.storage.set(this.key, graph)
      this.onSave?.(graph)
    }
    catch (err) {
      this.onError?.(err as Error)
      throw err
    }
  }

  /**
   * 恢复草稿
   *
   * 从存储中读取草稿，检查是否过期，若有效则恢复到表单。
   *
   * @returns 是否成功恢复（无草稿或已过期返回 false）
   */
  async restore(): Promise<boolean> {
    try {
      const graph = await this.storage.get(this.key)
      if (!graph) return false

      /* 检查过期 */
      if (this.maxAge > 0 && graph.timestamp) {
        const age = Date.now() - graph.timestamp
        if (age > this.maxAge) {
          await this.discard()
          return false
        }
      }

      this.form.setGraph(graph)
      this.onRestore?.(graph)
      return true
    }
    catch (err) {
      this.onError?.(err as Error)
      return false
    }
  }

  /**
   * 检查是否存在草稿
   *
   * 同时检查过期。如已过期自动清理并返回 false。
   */
  async hasDraft(): Promise<boolean> {
    try {
      const graph = await this.storage.get(this.key)
      if (!graph) return false

      if (this.maxAge > 0 && graph.timestamp) {
        const age = Date.now() - graph.timestamp
        if (age > this.maxAge) {
          await this.discard()
          return false
        }
      }

      return true
    }
    catch {
      return false
    }
  }

  /**
   * 丢弃草稿
   *
   * 从存储中删除当前表单的草稿数据。
   * 通常在表单提交成功后调用。
   */
  async discard(): Promise<void> {
    try {
      await this.storage.remove(this.key)
    }
    catch (err) {
      this.onError?.(err as Error)
    }
  }

  /** 销毁管理器 */
  dispose(): void {
    if ('cancel' in this.debouncedSave) {
      (this.debouncedSave as { cancel: () => void }).cancel()
    }

    for (const disposer of this.disposers) {
      disposer()
    }
    this.disposers = []

    if (this._unloadHandler && typeof window !== 'undefined') {
      window.removeEventListener('beforeunload', this._unloadHandler)
      this._unloadHandler = null
    }
  }
}
