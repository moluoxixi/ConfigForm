import type { FormPlugin } from '@moluoxixi/core'
import { exportPlugin } from '@moluoxixi/plugin-export'
import { importPlugin } from '@moluoxixi/plugin-import'
import { printPlugin } from '@moluoxixi/plugin-print'
import { useMemo } from 'react'

/**
 * Print Export Feature State：类型接口定义。
 * 所属模块：`playground/react/src/examples/11-misc/usePrintExportFeature.tsx`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export interface PrintExportFeatureState {
  plugins?: FormPlugin[]
}

/**
 * use Print Export Feature：当前功能模块的核心执行单元。
 * 所属模块：`playground/react/src/examples/11-misc/usePrintExportFeature.tsx`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param sceneName 参数 `sceneName`用于提供当前函数执行所需的输入信息。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
 */
export function usePrintExportFeature(sceneName: string): PrintExportFeatureState {
  const isPrintExportScene = sceneName === 'PrintExportForm'
  const plugins = useMemo<FormPlugin[] | undefined>(() => {
    if (!isPrintExportScene) {
      return undefined
    }

    const exportFeaturePlugin = exportPlugin({
      filenameBase: 'print-export',
    })
    const importFeaturePlugin = importPlugin()
    const printFeaturePlugin = printPlugin({
      print: {
        title: '打印预览 - PrintExportForm',
        target: '[data-configform-print-root="true"]',
      },
    })

    return [exportFeaturePlugin, importFeaturePlugin, printFeaturePlugin]
  }, [isPrintExportScene])

  return {
    plugins,
  }
}
