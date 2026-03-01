import type { FormPlugin } from '@moluoxixi/core'
import type { Ref } from 'vue'
import { historyPlugin } from '@moluoxixi/plugin-history'
import { computed, ref, watch } from 'vue'

export interface HistoryFeatureState {
  enabled: Ref<boolean>
  plugins: Ref<FormPlugin[]>
}

export function useHistoryFeature(currentDemo: Ref<string>): HistoryFeatureState {
  const enabled = ref(false)

  watch(
    () => currentDemo.value,
    (sceneName) => {
      enabled.value = sceneName === 'UndoRedoForm'
    },
    { immediate: true },
  )

  const plugins = computed<FormPlugin[]>(() => {
    if (!enabled.value) {
      return []
    }
    return [historyPlugin({ autoSave: true })]
  })

  return {
    enabled,
    plugins,
  }
}
