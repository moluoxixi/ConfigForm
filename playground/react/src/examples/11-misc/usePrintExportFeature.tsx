import type { FormPlugin } from '@moluoxixi/core'
import { exportPlugin } from '@moluoxixi/plugin-export'
import { importPlugin } from '@moluoxixi/plugin-import'
import { printPlugin } from '@moluoxixi/plugin-print'
import { useMemo } from 'react'

export interface PrintExportFeatureState {
  plugins?: FormPlugin[]
}

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
