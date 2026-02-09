import type { Disposer } from '@moluoxixi/shared'
import type { FormGraph, FormInstance } from '../types'
import { deepClone } from '@moluoxixi/shared'

/**
 * 操作记录
 *
 * 每次快照时记录操作类型和可选描述，
 * 方便调试和 UI 展示操作历史。
 */
export interface HistoryRecord {
  /** 表单状态快照 */
  graph: FormGraph
  /** 操作类型标识 */
  type: 'init' | 'input' | 'batch' | 'reset' | 'custom'
  /** 可选操作描述（如 "修改了用户名"） */
  description?: string
  /** 快照时间戳 */
  timestamp: number
}

/** FormHistory 配置 */
export interface FormHistoryConfig {
  /** 最大历史记录数（默认 50） */
  maxLength?: number
  /** 自动快照间隔（ms）。设为 0 禁用自动快照。默认 0（手动模式） */
  autoInterval?: number
  /**
   * 快照过滤器。返回 false 时跳过本次快照。
   * 用于避免无意义的重复快照（如值未变化时）。
   */
  filter?: (current: FormGraph, previous: FormGraph | undefined) => boolean
}

/** 默认最大历史记录数 */
const DEFAULT_MAX_LENGTH = 50

/**
 * 表单历史管理器（Undo/Redo）
 *
 * 基于 Form.getGraph() / setGraph() 实现时间旅行。
 * 使用不可变快照栈，每次操作存储完整 FormGraph 快照。
 *
 * 设计要点：
 * - 栈式存储：undoStack 存历史，redoStack 存前进记录
 * - 新操作清空 redoStack（分叉后丢弃旧的前进历史）
 * - 配置化最大长度，超出后淘汰最早记录
 * - 支持自动快照和手动快照两种模式
 * - 支持批量操作（多步操作合并为一次快照）
 *
 * @example
 * ```ts
 * const form = createForm({ initialValues: { name: '' } })
 * const history = new FormHistory(form, { maxLength: 30 })
 *
 * // 手动保存快照
 * history.save('input', '修改了姓名')
 *
 * // 撤销
 * history.undo()
 *
 * // 重做
 * history.redo()
 *
 * // 批量操作（多步合并为一次快照）
 * history.batch(() => {
 *   form.setFieldValue('firstName', 'John')
 *   form.setFieldValue('lastName', 'Doe')
 * }, '设置完整姓名')
 *
 * // 销毁
 * history.dispose()
 * ```
 */
export class FormHistory {
  private form: FormInstance
  private undoStack: HistoryRecord[] = []
  private redoStack: HistoryRecord[] = []
  private maxLength: number
  private autoTimer: ReturnType<typeof setInterval> | null = null
  private filter?: FormHistoryConfig['filter']
  /** 批量操作标志：为 true 时 save 被抑制 */
  private _batching = false
  /** 变化监听器 */
  private _changeListeners: Array<() => void> = []

  constructor(form: FormInstance, config: FormHistoryConfig = {}) {
    this.form = form
    this.maxLength = config.maxLength ?? DEFAULT_MAX_LENGTH
    this.filter = config.filter

    /* 保存初始状态 */
    this.pushRecord('init', '初始状态')

    /* 配置自动快照 */
    if (config.autoInterval && config.autoInterval > 0) {
      this.autoTimer = setInterval(() => {
        this.save('input')
      }, config.autoInterval)
    }
  }

  /** 当前历史位置索引（从 0 开始，0 = 最新） */
  get cursor(): number {
    return this.undoStack.length - 1
  }

  /** 是否可以撤销 */
  get canUndo(): boolean {
    return this.undoStack.length > 1
  }

  /** 是否可以重做 */
  get canRedo(): boolean {
    return this.redoStack.length > 0
  }

  /** 撤销栈长度 */
  get undoCount(): number {
    return Math.max(0, this.undoStack.length - 1)
  }

  /** 重做栈长度 */
  get redoCount(): number {
    return this.redoStack.length
  }

  /** 所有历史记录（只读快照） */
  get records(): readonly HistoryRecord[] {
    return this.undoStack
  }

  /**
   * 保存当前状态快照
   *
   * @param type - 操作类型标识
   * @param description - 可选操作描述
   * @returns 是否成功保存（filter 返回 false 时为 false）
   */
  save(type: HistoryRecord['type'] = 'custom', description?: string): boolean {
    if (this._batching) return false

    const graph = this.form.getGraph()

    /* 过滤器检查 */
    if (this.filter) {
      const previous = this.undoStack.length > 0
        ? this.undoStack[this.undoStack.length - 1].graph
        : undefined
      if (!this.filter(graph, previous)) return false
    }

    this.pushRecord(type, description)

    /* 新操作清空 redo 栈（分叉丢弃前进历史） */
    this.redoStack = []
    this.notifyChange()
    return true
  }

  /**
   * 撤销
   *
   * 将当前状态压入 redo 栈，弹出 undo 栈顶并恢复。
   *
   * @returns 是否成功撤销
   */
  undo(): boolean {
    if (!this.canUndo) return false

    const current = this.undoStack.pop()!
    this.redoStack.push(current)

    const target = this.undoStack[this.undoStack.length - 1]
    this.form.setGraph(deepClone(target.graph))
    this.notifyChange()
    return true
  }

  /**
   * 重做
   *
   * 从 redo 栈弹出并恢复，同时压入 undo 栈。
   *
   * @returns 是否成功重做
   */
  redo(): boolean {
    if (!this.canRedo) return false

    const record = this.redoStack.pop()!
    this.undoStack.push(record)

    this.form.setGraph(deepClone(record.graph))
    this.notifyChange()
    return true
  }

  /**
   * 批量操作
   *
   * 将多步操作合并为一次快照。
   * 执行期间 save 调用被抑制，结束后自动保存一次快照。
   *
   * @param fn - 批量操作函数
   * @param description - 操作描述
   */
  batch(fn: () => void, description?: string): void {
    this._batching = true
    try {
      fn()
    }
    finally {
      this._batching = false
      this.save('batch', description)
    }
  }

  /**
   * 跳转到指定历史位置
   *
   * @param index - 目标索引（0 = 最早，length-1 = 最新）
   * @returns 是否成功跳转
   */
  goto(index: number): boolean {
    if (index < 0 || index >= this.undoStack.length) return false

    const currentIndex = this.undoStack.length - 1
    if (index === currentIndex) return false

    if (index < currentIndex) {
      /* 向前跳转：将多余的记录移到 redo 栈 */
      const count = currentIndex - index
      for (let i = 0; i < count; i++) {
        this.redoStack.push(this.undoStack.pop()!)
      }
    }
    else {
      /* 向后跳转：将 redo 记录移回 undo 栈 */
      const count = index - currentIndex
      for (let i = 0; i < count; i++) {
        this.undoStack.push(this.redoStack.pop()!)
      }
    }

    const target = this.undoStack[this.undoStack.length - 1]
    this.form.setGraph(deepClone(target.graph))
    this.notifyChange()
    return true
  }

  /** 清空所有历史，仅保留当前状态 */
  clear(): void {
    const current = this.undoStack.length > 0
      ? this.undoStack[this.undoStack.length - 1]
      : { graph: this.form.getGraph(), type: 'init' as const, timestamp: Date.now() }

    this.undoStack = [current]
    this.redoStack = []
    this.notifyChange()
  }

  /**
   * 监听历史变化
   *
   * 当 undo/redo/save/clear 执行后触发回调。
   * 适用于 UI 更新撤销/重做按钮状态。
   */
  onChange(handler: () => void): Disposer {
    this._changeListeners.push(handler)
    return () => {
      const idx = this._changeListeners.indexOf(handler)
      if (idx !== -1) this._changeListeners.splice(idx, 1)
    }
  }

  /** 销毁 */
  dispose(): void {
    if (this.autoTimer) {
      clearInterval(this.autoTimer)
      this.autoTimer = null
    }
    this.undoStack = []
    this.redoStack = []
    this._changeListeners = []
  }

  /** 压入历史记录（自动淘汰超出上限的最早记录） */
  private pushRecord(type: HistoryRecord['type'], description?: string): void {
    const graph = this.form.getGraph()
    this.undoStack.push({
      graph,
      type,
      description,
      timestamp: Date.now(),
    })

    /* 超出上限，淘汰最早的记录 */
    while (this.undoStack.length > this.maxLength) {
      this.undoStack.shift()
    }
  }

  /** 通知变化监听器 */
  private notifyChange(): void {
    for (const listener of this._changeListeners) {
      listener()
    }
  }
}
