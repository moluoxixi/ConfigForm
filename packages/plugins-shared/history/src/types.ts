import type { Disposer, FormGraph, FormPlugin } from '@moluoxixi/core'

export type HistoryRecordType = 'init' | 'input' | 'batch' | 'reset' | 'custom'

export interface HistoryRecord {
  graph: FormGraph
  type: HistoryRecordType
  description?: string
  timestamp: number
}

export interface HistoryPluginConfig {
  maxLength?: number
  autoSave?: boolean
  keyboard?: boolean
  filter?: (current: FormGraph, previous: FormGraph | undefined) => boolean
}

export interface HistoryPluginAPI {
  save: (type?: HistoryRecordType, description?: string) => boolean
  undo: () => boolean
  redo: () => boolean
  batch: (fn: () => void, description?: string) => void
  goto: (index: number) => boolean
  clear: () => void
  onChange: (handler: () => void) => Disposer
  readonly canUndo: boolean
  readonly canRedo: boolean
  readonly undoCount: number
  readonly redoCount: number
  readonly records: readonly HistoryRecord[]
}

export type FormHistoryPlugin = FormPlugin<HistoryPluginAPI>

declare module '@moluoxixi/core' {
  interface FormInstance {
    history?: HistoryPluginAPI
  }
}
