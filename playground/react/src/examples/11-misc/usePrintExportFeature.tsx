import type { FormPlugin } from '@moluoxixi/core'
import { exportPlugin } from '@moluoxixi/plugin-export-react'
import { importPlugin } from '@moluoxixi/plugin-import-react'
import { printPlugin } from '@moluoxixi/plugin-print-react'
import { ExportJsonAction, ImportJsonAction, PrintAction } from '@moluoxixi/ui-antd'
import React, { useMemo } from 'react'

export interface PrintExportFeatureState {
  plugins?: FormPlugin[]
  formExtra?: React.ReactNode
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

  const panelStyle: React.CSSProperties = {
    marginBottom: 14,
    border: '1px solid #d9e3ff',
    borderRadius: 14,
    background: 'linear-gradient(180deg, #f8fbff 0%, #ffffff 52%)',
    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
    padding: 14,
  }

  const formExtra = plugins
    ? (
        <div style={panelStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1f2937', marginBottom: 2 }}>JSON 导入 / 导出</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>插件适配层负责弹窗、上传、预览与应用逻辑</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <ExportJsonAction />
            <ImportJsonAction />
            <PrintAction />
          </div>
          <div style={{ marginTop: 10, fontSize: 12, color: '#64748b' }}>
            打印默认切到阅读态，并基于阅读态容器输出。
          </div>
          <div style={{ marginTop: 6, fontSize: 12, color: '#94a3b8' }}>
            导入/导出的完整交互由插件层托管，示例层仅做组合。
          </div>
        </div>
      )
    : undefined

  return {
    plugins,
    formExtra,
  }
}
