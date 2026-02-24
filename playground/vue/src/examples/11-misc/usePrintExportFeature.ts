import type { FormPlugin } from '@moluoxixi/core'
import type { Ref } from 'vue'
import { exportPlugin } from '@moluoxixi/plugin-export'
import { importPlugin } from '@moluoxixi/plugin-import'
import { printPlugin } from '@moluoxixi/plugin-print'
import { computed, ref, watch } from 'vue'

/**
 * Print Export Feature State：描述该模块对外暴露的数据结构。
 * 所属模块：`playground/vue/src/examples/11-misc/usePrintExportFeature.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export interface PrintExportFeatureState {
  enabled: Ref<boolean>
  plugins: Ref<FormPlugin[]>
}

/**
 * use Print Export Feature：封装该模块的核心渲染与交互逻辑。
 * 所属模块：`playground/vue/src/examples/11-misc/usePrintExportFeature.ts`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param currentDemo 参数 `currentDemo`用于提供当前函数执行所需的输入信息。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
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
