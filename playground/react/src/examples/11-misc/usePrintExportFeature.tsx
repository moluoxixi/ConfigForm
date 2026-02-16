import type { FormPlugin } from '@moluoxixi/core'
import { exportPlugin } from '@moluoxixi/plugin-export-react'
import { importPlugin } from '@moluoxixi/plugin-import-react'
import { printPlugin } from '@moluoxixi/plugin-print-react'
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
