import type { FormPlugin } from '@moluoxixi/core'
import { historyPlugin } from '@moluoxixi/plugin-history'
import { useMemo } from 'react'

export interface HistoryFeatureState {
  plugins?: FormPlugin[]
}

export function useHistoryFeature(sceneName: string): HistoryFeatureState {
  const isUndoRedoScene = sceneName === 'UndoRedoForm'

  const plugins = useMemo<FormPlugin[] | undefined>(() => {
    if (!isUndoRedoScene) {
      return undefined
    }
    return [historyPlugin({ autoSave: true })]
  }, [isUndoRedoScene])

  return {
    plugins,
  }
}
