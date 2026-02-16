import type { FormPlugin } from '@moluoxixi/core'
import type { Ref } from 'vue'
import { exportPlugin } from '@moluoxixi/plugin-export-vue'
import { importPlugin } from '@moluoxixi/plugin-import-vue'
import { printPlugin } from '@moluoxixi/plugin-print-vue'
import { computed, ref, watch } from 'vue'

export interface PrintExportFeatureState {
  enabled: Ref<boolean>
  plugins: Ref<FormPlugin[]>
}

export function usePrintExportFeature(currentDemo: Ref<string>): PrintExportFeatureState {
  const enabled = ref(false)
  watch(
    () => currentDemo.value,
    (demo) => {
      enabled.value = demo === 'PrintExportForm'
    },
    { immediate: true },
  )
  const plugins = computed<FormPlugin[]>(() => {
    if (!enabled.value) {
      return []
    }
    return [
      exportPlugin({ filenameBase: 'print-export' }),
      importPlugin(),
      printPlugin({
        print: {
          title: '打印预览 - PrintExportForm',
          target: '[data-configform-print-root="true"]',
        },
      }),
    ]
  })

  return {
    enabled,
    plugins,
  }
}
