import type { FormPlugin } from '@moluoxixi/core'
import type { Ref } from 'vue'
import { exportPlugin } from '@moluoxixi/plugin-export'
import { importPlugin } from '@moluoxixi/plugin-import'
import { printPlugin } from '@moluoxixi/plugin-print'
import { computed, ref, watch } from 'vue'

export interface PrintExportFeatureState {
  enabled: Ref<boolean>
  plugins: Ref<FormPlugin[]>
}

/**
 * use Print Export Feature：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 use Print Export Feature 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
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
