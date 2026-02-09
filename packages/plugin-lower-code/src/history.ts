import type { Disposer } from '@moluoxixi/shared'
import type { FormGraph, FormInstance, FormPlugin, PluginContext, PluginInstallResult } from '@moluoxixi/core'
import { FormLifeCycle } from '@moluoxixi/core'
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

/** 插件配置 */
export interface HistoryPluginConfig {
  /** 最大历史记录数（默认 50） */
  maxLength?: number
  /** 自动快照间隔（ms）。设为 0 禁用自动快照。默认 0（手动模式） */
  autoInterval?: number
  /**
   * 是否在值变化时自动保存快照（默认 true）
   *
   * 开启后无需手动调用 save()，每次 form.values 变化自动记录。
   */
  autoSave?: boolean
  /**
   * 是否启用键盘快捷键（默认 true）
   *
   * - Ctrl+Z / Cmd+Z：撤销
   * - Ctrl+Y / Cmd+Y：重做
   */
  keyboard?: boolean
  /**
   * 快照过滤器。返回 false 时跳过本次快照。
   * 用于避免无意义的重复快照（如值未变化时）。
   */
  filter?: (current: FormGraph, previous: FormGraph | undefined) => boolean
}

/** 插件暴露的 API */
export interface HistoryPluginAPI {
  /** 保存当前状态快照 */
  save: (type?: HistoryRecord['type'], description?: string) => boolean
  /** 撤销 */
  undo: () => boolean
  /** 重做 */
  redo: () => boolean
  /** 批量操作（多步合并为一次快照） */
  batch: (fn: () => void, description?: string) => void
  /** 跳转到指定历史位置 */
  goto: (index: number) => boolean
  /** 清空历史，仅保留当前状态 */
  clear: () => void
  /** 监听历史变化 */
  onChange: (handler: () => void) => Disposer
  /** 是否可以撤销 */
  readonly canUndo: boolean
  /** 是否可以重做 */
  readonly canRedo: boolean
  /** 撤销栈长度 */
  readonly undoCount: number
  /** 重做栈长度 */
  readonly redoCount: number
  /** 所有历史记录 */
  readonly records: readonly HistoryRecord[]
}

/** 默认最大历史记录数 */
const DEFAULT_MAX_LENGTH = 50

/** 插件名称 */
export const PLUGIN_NAME = 'history'

/**
 * 撤销/重做插件
 *
 * 基于 Form.getGraph() / setGraph() 实现时间旅行。
 * 使用不可变快照栈，每次操作存储完整 FormGraph 快照。
 *
 * @param config - 插件配置
 * @returns FormPlugin 实例
 *
 * @example
 * ```ts
 * import { createForm } from '@moluoxixi/core'
 * import { historyPlugin, type HistoryPluginAPI } from '@moluoxixi/plugin-history'
 *
 * const form = createForm({
 *   initialValues: { name: '' },
 *   plugins: [historyPlugin({ maxLength: 30 })],
 * })
 *
 * const history = form.getPlugin<HistoryPluginAPI>('history')!
 * history.save('input', '修改了姓名')
 * history.undo()
 * history.redo()
 * ```
 */
export function historyPlugin(config: HistoryPluginConfig = {}): FormPlugin<HistoryPluginAPI> {
  return {
    name: PLUGIN_NAME,
    install(form: FormInstance, _context: PluginContext): PluginInstallResult<HistoryPluginAPI> {
      const maxLength = config.maxLength ?? DEFAULT_MAX_LENGTH
      const filter = config.filter

      let undoStack: HistoryRecord[] = []
      let redoStack: HistoryRecord[] = []
      let batching = false
      let autoTimer: ReturnType<typeof setInterval> | null = null
      let changeListeners: Array<() => void> = []

      /** 通知变化监听器 */
      function notifyChange(): void {
        for (const listener of changeListeners) {
          listener()
        }
      }

      /** 压入历史记录（自动淘汰超出上限的最早记录） */
      function pushRecord(type: HistoryRecord['type'], description?: string): void {
        const graph = form.getGraph()
        undoStack.push({ graph, type, description, timestamp: Date.now() })
        while (undoStack.length > maxLength) {
          undoStack.shift()
        }
      }

      /** undo/redo 执行中标记（防止 setGraph 触发的值变化再次保存快照） */
      let restoring = false

      /* 保存初始状态 */
      pushRecord('init', '初始状态')

      /* 配置定时自动快照 */
      if (config.autoInterval && config.autoInterval > 0) {
        autoTimer = setInterval(() => {
          api.save('input')
        }, config.autoInterval)
      }

      /* 值变化自动保存快照（默认开启） */
      let valuesDisposer: Disposer | null = null
      if (config.autoSave !== false) {
        valuesDisposer = form.on(FormLifeCycle.ON_FORM_VALUES_CHANGE, () => {
          if (restoring || batching) return
          api.save('input')
        })
      }

      /* 键盘快捷键 Ctrl+Z 撤销 / Ctrl+Y 重做（默认开启） */
      let keydownHandler: ((e: KeyboardEvent) => void) | null = null
      if (config.keyboard !== false && typeof window !== 'undefined') {
        keydownHandler = (e: KeyboardEvent): void => {
          const mod = e.ctrlKey || e.metaKey
          if (!mod) return

          if (e.key === 'z') {
            e.preventDefault()
            api.undo()
          }
          else if (e.key === 'y') {
            e.preventDefault()
            api.redo()
          }
        }
        window.addEventListener('keydown', keydownHandler)
      }

      const api: HistoryPluginAPI = {
        save(type: HistoryRecord['type'] = 'custom', description?: string): boolean {
          if (batching) return false

          const graph = form.getGraph()
          if (filter) {
            const previous = undoStack.length > 0
              ? undoStack[undoStack.length - 1].graph
              : undefined
            if (!filter(graph, previous)) return false
          }

          pushRecord(type, description)
          redoStack = []
          notifyChange()
          return true
        },

        undo(): boolean {
          if (undoStack.length <= 1) return false
          restoring = true
          try {
            const current = undoStack.pop()!
            redoStack.push(current)
            const target = undoStack[undoStack.length - 1]
            form.setGraph(deepClone(target.graph))
            notifyChange()
            return true
          }
          finally {
            restoring = false
          }
        },

        redo(): boolean {
          if (redoStack.length === 0) return false
          restoring = true
          try {
            const record = redoStack.pop()!
            undoStack.push(record)
            form.setGraph(deepClone(record.graph))
            notifyChange()
            return true
          }
          finally {
            restoring = false
          }
        },

        batch(fn: () => void, description?: string): void {
          batching = true
          try { fn() }
          finally {
            batching = false
            api.save('batch', description)
          }
        },

        goto(index: number): boolean {
          if (index < 0 || index >= undoStack.length) return false
          const currentIndex = undoStack.length - 1
          if (index === currentIndex) return false

          restoring = true
          try {
            if (index < currentIndex) {
              const count = currentIndex - index
              for (let i = 0; i < count; i++) {
                redoStack.push(undoStack.pop()!)
              }
            }
            else {
              const count = index - currentIndex
              for (let i = 0; i < count; i++) {
                undoStack.push(redoStack.pop()!)
              }
            }

            const target = undoStack[undoStack.length - 1]
            form.setGraph(deepClone(target.graph))
            notifyChange()
            return true
          }
          finally {
            restoring = false
          }
        },

        clear(): void {
          const current = undoStack.length > 0
            ? undoStack[undoStack.length - 1]
            : { graph: form.getGraph(), type: 'init' as const, timestamp: Date.now() }
          undoStack = [current]
          redoStack = []
          notifyChange()
        },

        onChange(handler: () => void): Disposer {
          changeListeners.push(handler)
          return () => {
            const idx = changeListeners.indexOf(handler)
            if (idx !== -1) changeListeners.splice(idx, 1)
          }
        },

        get canUndo() { return undoStack.length > 1 },
        get canRedo() { return redoStack.length > 0 },
        get undoCount() { return Math.max(0, undoStack.length - 1) },
        get redoCount() { return redoStack.length },
        get records() { return undoStack },
      }

      return {
        api,
        dispose(): void {
          if (autoTimer) {
            clearInterval(autoTimer)
            autoTimer = null
          }
          if (valuesDisposer) {
            valuesDisposer()
            valuesDisposer = null
          }
          if (keydownHandler && typeof window !== 'undefined') {
            window.removeEventListener('keydown', keydownHandler)
            keydownHandler = null
          }
          undoStack = []
          redoStack = []
          changeListeners = []
        },
      }
    },
  }
}
