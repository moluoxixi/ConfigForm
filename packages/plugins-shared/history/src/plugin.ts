import type { FormInstance, FormPlugin } from '@moluoxixi/core'
import type { HistoryPluginAPI, HistoryPluginConfig, HistoryRecord, HistoryRecordType } from './types'
import { FormLifeCycle, deepClone } from '@moluoxixi/core'

const DEFAULT_MAX_LENGTH = 50

export const PLUGIN_NAME = 'history'

function createRecord(graph: HistoryRecord['graph'], type: HistoryRecordType, description?: string): HistoryRecord {
  return {
    graph: deepClone(graph),
    type,
    description,
    timestamp: Date.now(),
  }
}

export function historyPlugin(config: HistoryPluginConfig = {}): FormPlugin<HistoryPluginAPI> {
  const maxLength = Math.max(1, config.maxLength ?? DEFAULT_MAX_LENGTH)
  const autoSave = config.autoSave === true

  return {
    name: PLUGIN_NAME,
    install(form: FormInstance) {
      const formWithHistory = form as FormInstance & { history?: HistoryPluginAPI }
      const listeners = new Set<() => void>()

      let undoStack: HistoryRecord[] = []
      let redoStack: HistoryRecord[] = []
      let restoring = false
      let batching = false

      const notify = (): void => {
        for (const listener of listeners) {
          listener()
        }
      }

      const pushUndo = (record: HistoryRecord): void => {
        undoStack.push(record)
        while (undoStack.length > maxLength) {
          undoStack.shift()
        }
      }

      pushUndo(createRecord(form.getGraph(), 'init', 'initial'))

      const api: HistoryPluginAPI = {
        save(type: HistoryRecordType = 'custom', description?: string): boolean {
          if (batching || restoring) {
            return false
          }

          const currentGraph = form.getGraph()
          if (config.filter) {
            const previous = undoStack.length > 0 ? undoStack[undoStack.length - 1].graph : undefined
            if (!config.filter(currentGraph, previous)) {
              return false
            }
          }

          pushUndo(createRecord(currentGraph, type, description))
          redoStack = []
          notify()
          return true
        },

        undo(): boolean {
          if (undoStack.length <= 1) {
            return false
          }

          restoring = true
          try {
            const current = undoStack.pop()!
            redoStack.push(current)

            const target = undoStack[undoStack.length - 1]
            form.setGraph(deepClone(target.graph))
            notify()
            return true
          }
          finally {
            restoring = false
          }
        },

        redo(): boolean {
          if (redoStack.length === 0) {
            return false
          }

          restoring = true
          try {
            const target = redoStack.pop()!
            undoStack.push(target)
            form.setGraph(deepClone(target.graph))
            notify()
            return true
          }
          finally {
            restoring = false
          }
        },

        batch(fn: () => void, description?: string): void {
          batching = true
          try {
            fn()
          }
          finally {
            batching = false
            api.save('batch', description)
          }
        },

        goto(index: number): boolean {
          if (index < 0 || index >= undoStack.length) {
            return false
          }

          const currentIndex = undoStack.length - 1
          if (index === currentIndex) {
            return false
          }

          restoring = true
          try {
            if (index < currentIndex) {
              const moveCount = currentIndex - index
              for (let i = 0; i < moveCount; i++) {
                redoStack.push(undoStack.pop()!)
              }
            }
            else {
              const moveCount = index - currentIndex
              if (moveCount > redoStack.length) {
                return false
              }
              for (let i = 0; i < moveCount; i++) {
                undoStack.push(redoStack.pop()!)
              }
            }

            const target = undoStack[undoStack.length - 1]
            form.setGraph(deepClone(target.graph))
            notify()
            return true
          }
          finally {
            restoring = false
          }
        },

        clear(): void {
          const current = undoStack.length > 0
            ? undoStack[undoStack.length - 1]
            : createRecord(form.getGraph(), 'init', 'initial')
          undoStack = [current]
          redoStack = []
          notify()
        },

        onChange(handler: () => void): () => void {
          listeners.add(handler)
          return () => {
            listeners.delete(handler)
          }
        },

        get canUndo() {
          return undoStack.length > 1
        },

        get canRedo() {
          return redoStack.length > 0
        },

        get undoCount() {
          return Math.max(undoStack.length - 1, 0)
        },

        get redoCount() {
          return redoStack.length
        },

        get records() {
          return undoStack
        },
      }

      const disposeValues = autoSave
        ? form.onValuesChange(() => {
            if (restoring || batching) {
              return
            }
            api.save('input')
          })
        : () => {}

      const disposeReset = autoSave
        ? form.on(FormLifeCycle.ON_FORM_RESET, () => {
            if (restoring || batching) {
              return
            }
            api.save('reset')
          })
        : () => {}

      let keydownHandler: ((event: KeyboardEvent) => void) | undefined
      if (config.keyboard !== false && typeof window !== 'undefined') {
        keydownHandler = (event: KeyboardEvent): void => {
          const withModifier = event.ctrlKey || event.metaKey
          if (!withModifier || event.altKey) {
            return
          }

          const key = event.key.toLowerCase()
          if (key === 'z' && !event.shiftKey) {
            event.preventDefault()
            api.undo()
            return
          }

          if (key === 'y' || (key === 'z' && event.shiftKey)) {
            event.preventDefault()
            api.redo()
          }
        }
        window.addEventListener('keydown', keydownHandler)
      }

      formWithHistory.history = api

      return {
        api,
        dispose() {
          if (formWithHistory.history === api) {
            delete formWithHistory.history
          }
          if (keydownHandler && typeof window !== 'undefined') {
            window.removeEventListener('keydown', keydownHandler)
          }
          disposeValues()
          disposeReset()
          undoStack = []
          redoStack = []
          listeners.clear()
        },
      }
    },
  }
}
