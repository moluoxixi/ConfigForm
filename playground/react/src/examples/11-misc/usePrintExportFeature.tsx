import type { FormPlugin } from '@moluoxixi/core'
import { createReactFormExportRuntime } from '@moluoxixi/plugin-export-react'
import { createReactFormImportRuntime } from '@moluoxixi/plugin-import-react'
import { createReactFormPrintRuntime } from '@moluoxixi/plugin-print-react'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

type ImportStrategy = 'merge' | 'shallow' | 'replace'

interface ImportPreviewState {
  type: 'JSON' | 'CSV'
  raw: string
  data: Record<string, unknown>
  appliedKeys: string[]
  skippedKeys: string[]
}

export interface PrintExportFeatureState {
  plugins?: FormPlugin[]
  headerExtra?: React.ReactNode
}

export function usePrintExportFeature(sceneName: string): PrintExportFeatureState {
  const isPrintExportScene = sceneName === 'PrintExportForm'
  const runtimes = useMemo(() => {
    if (!isPrintExportScene) {
      return undefined
    }
    const exportRuntime = createReactFormExportRuntime({
      filenameBase: 'print-export',
    })
    const importRuntime = createReactFormImportRuntime()
    const printRuntime = createReactFormPrintRuntime({
      print: {
        title: '打印预览 - PrintExportForm',
      },
    })
    return {
      exportRuntime,
      importRuntime,
      printRuntime,
      plugins: [exportRuntime.plugin, importRuntime.plugin, printRuntime.plugin],
    }
  }, [isPrintExportScene])

  const [ioMessage, setIoMessage] = useState('')
  const [exportJsonPreview, setExportJsonPreview] = useState('')
  const [exportCsvPreview, setExportCsvPreview] = useState('')
  const [importStrategy, setImportStrategy] = useState<ImportStrategy>('merge')
  const [importPreview, setImportPreview] = useState<ImportPreviewState | null>(null)
  const jsonFileInputRef = useRef<HTMLInputElement | null>(null)
  const csvFileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    setIoMessage('')
    setImportPreview(null)
    setImportStrategy('merge')
  }, [sceneName])

  useEffect(() => {
    if (!runtimes) {
      setExportJsonPreview('')
      setExportCsvPreview('')
      return
    }
    return runtimes.exportRuntime.subscribeExportPreview((preview) => {
      setExportJsonPreview(preview.json)
      setExportCsvPreview(preview.csv)
    })
  }, [runtimes])

  const handleImportDone = useCallback((type: 'JSON' | 'CSV', count: number) => {
    setIoMessage(`${type} 导入成功：已更新 ${count} 个字段`)
  }, [])

  const handleImportError = useCallback((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error)
    setIoMessage(`导入失败：${message}`)
  }, [])

  const handleActionError = useCallback((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error)
    setIoMessage(`操作失败：${message}`)
  }, [])

  const onJsonFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || !runtimes) {
      return
    }
    try {
      const [raw, result] = await Promise.all([
        file.text(),
        runtimes.importRuntime.parseImportJSONFile(file, { strategy: importStrategy }),
      ])
      setImportPreview({
        type: 'JSON',
        raw,
        data: result.data,
        appliedKeys: result.appliedKeys,
        skippedKeys: result.skippedKeys,
      })
      setIoMessage(`JSON 解析完成：可导入 ${result.appliedKeys.length} 个字段`)
    }
    catch (error) {
      handleImportError(error)
    }
  }, [handleImportError, importStrategy, runtimes])

  const onCsvFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || !runtimes) {
      return
    }
    try {
      const [raw, result] = await Promise.all([
        file.text(),
        runtimes.importRuntime.parseImportCSVFile(file, { strategy: importStrategy }),
      ])
      setImportPreview({
        type: 'CSV',
        raw,
        data: result.data,
        appliedKeys: result.appliedKeys,
        skippedKeys: result.skippedKeys,
      })
      setIoMessage(`CSV 解析完成：可导入 ${result.appliedKeys.length} 个字段`)
    }
    catch (error) {
      handleImportError(error)
    }
  }, [handleImportError, importStrategy, runtimes])

  const applyImportPreview = useCallback(() => {
    if (!runtimes || !importPreview) {
      return
    }
    try {
      const result = runtimes.importRuntime.applyImport(importPreview.data, { strategy: importStrategy })
      handleImportDone(importPreview.type, result.appliedKeys.length)
      setImportPreview(null)
    }
    catch (error) {
      handleImportError(error)
    }
  }, [handleImportDone, handleImportError, importPreview, importStrategy, runtimes])

  const headerExtra = runtimes
    ? (
        <div style={{ marginBottom: 12, border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#555' }}>
              操作：
            </span>
            <button type="button" onClick={() => { void runtimes.exportRuntime.downloadJSON({ filename: 'order-export.json' }).catch(handleActionError) }}>导出 JSON</button>
            <button type="button" onClick={() => { void runtimes.exportRuntime.downloadCSV({ filename: 'order-export.csv' }).catch(handleActionError) }}>导出 CSV</button>
            <button type="button" onClick={() => jsonFileInputRef.current?.click()}>导入 JSON</button>
            <button type="button" onClick={() => csvFileInputRef.current?.click()}>导入 CSV</button>
            <label style={{ fontSize: 12, color: '#555' }}>
              导入策略：
              {' '}
              <select
                value={importStrategy}
                onChange={event => setImportStrategy(event.target.value as ImportStrategy)}
              >
                <option value="merge">merge</option>
                <option value="shallow">shallow</option>
                <option value="replace">replace</option>
              </select>
            </label>
            <button type="button" onClick={() => { void runtimes.printRuntime.print().catch(handleActionError) }}>打印预览</button>
            <input
              ref={jsonFileInputRef}
              type="file"
              accept=".json,application/json"
              style={{ display: 'none' }}
              onChange={onJsonFileChange}
            />
            <input
              ref={csvFileInputRef}
              type="file"
              accept=".csv,text/csv"
              style={{ display: 'none' }}
              onChange={onCsvFileChange}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>JSON 导出预览</div>
              <textarea readOnly rows={8} value={exportJsonPreview} style={{ width: '100%', fontFamily: 'monospace', fontSize: 12 }} />
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>CSV 导出预览</div>
              <textarea readOnly rows={8} value={exportCsvPreview} style={{ width: '100%', fontFamily: 'monospace', fontSize: 12 }} />
            </div>
          </div>
          {importPreview
            ? (
                <div style={{ borderTop: '1px dashed #d0d7de', paddingTop: 8 }}>
                  <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
                    {importPreview.type}
                    {' '}
                    导入预览：可导入
                    {' '}
                    {importPreview.appliedKeys.length}
                    {' '}
                    字段
                    {importPreview.skippedKeys.length > 0 ? `，跳过 ${importPreview.skippedKeys.join(', ')}` : ''}
                  </div>
                  <textarea readOnly rows={5} value={importPreview.raw} style={{ width: '100%', fontFamily: 'monospace', fontSize: 12, marginBottom: 8 }} />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="button" onClick={applyImportPreview}>应用导入</button>
                    <button type="button" onClick={() => setImportPreview(null)}>清空导入预览</button>
                  </div>
                </div>
              )
            : null}
          {ioMessage
            ? (
                <div style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
                  {ioMessage}
                </div>
              )
            : null}
        </div>
      )
    : undefined

  return {
    plugins: runtimes?.plugins,
    headerExtra,
  }
}
