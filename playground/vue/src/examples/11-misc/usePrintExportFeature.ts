import type { FormPlugin } from '@moluoxixi/core'
import type { Ref } from 'vue'
import { createVueFormExportRuntime } from '@moluoxixi/plugin-export-vue'
import { createVueFormImportRuntime } from '@moluoxixi/plugin-import-vue'
import { createVueFormPrintRuntime } from '@moluoxixi/plugin-print-vue'
import { computed, ref, shallowRef, watch } from 'vue'

type ImportStrategy = 'merge' | 'shallow' | 'replace'

interface ImportPreviewState {
  type: 'JSON' | 'CSV'
  raw: string
  data: Record<string, unknown>
  appliedKeys: string[]
  skippedKeys: string[]
}

interface PrintExportRuntimes {
  exportRuntime: ReturnType<typeof createVueFormExportRuntime>
  importRuntime: ReturnType<typeof createVueFormImportRuntime>
  printRuntime: ReturnType<typeof createVueFormPrintRuntime>
  plugins: FormPlugin[]
}

export interface PrintExportFeatureState {
  ioRuntime: Ref<PrintExportRuntimes | undefined>
  ioMessage: Ref<string>
  exportJsonPreview: Ref<string>
  exportCsvPreview: Ref<string>
  importStrategy: Ref<ImportStrategy>
  importPreview: Ref<ImportPreviewState | null>
  jsonFileInput: Ref<HTMLInputElement | null>
  csvFileInput: Ref<HTMLInputElement | null>
  exportJson: () => void
  exportCsv: () => void
  printForm: () => void
  openJsonImport: () => void
  openCsvImport: () => void
  onJsonFileChange: (event: Event) => Promise<void>
  onCsvFileChange: (event: Event) => Promise<void>
  applyImportPreview: () => void
  clearImportPreview: () => void
  plugins: Ref<FormPlugin[]>
}

export function usePrintExportFeature(currentDemo: Ref<string>): PrintExportFeatureState {
  const ioRuntime = shallowRef<PrintExportRuntimes | undefined>(undefined)
  const ioMessage = ref('')
  const exportJsonPreview = ref('')
  const exportCsvPreview = ref('')
  const importStrategy = ref<ImportStrategy>('merge')
  const importPreview = ref<ImportPreviewState | null>(null)
  const jsonFileInput = ref<HTMLInputElement | null>(null)
  const csvFileInput = ref<HTMLInputElement | null>(null)

  watch(() => currentDemo.value === 'PrintExportForm', (enabled) => {
    ioMessage.value = ''
    importPreview.value = null
    importStrategy.value = 'merge'
    if (!enabled) {
      ioRuntime.value = undefined
      return
    }
    const exportRuntime = createVueFormExportRuntime({
      filenameBase: 'print-export',
    })
    const importRuntime = createVueFormImportRuntime()
    const printRuntime = createVueFormPrintRuntime({
      print: {
        title: '打印预览 - PrintExportForm',
      },
    })
    ioRuntime.value = {
      exportRuntime,
      importRuntime,
      printRuntime,
      plugins: [exportRuntime.plugin, importRuntime.plugin, printRuntime.plugin],
    }
  }, { immediate: true })

  watch(ioRuntime, (runtime, _prev, onCleanup) => {
    if (!runtime) {
      exportJsonPreview.value = ''
      exportCsvPreview.value = ''
      return
    }
    const dispose = runtime.exportRuntime.subscribeExportPreview((preview) => {
      exportJsonPreview.value = preview.json
      exportCsvPreview.value = preview.csv
    })
    onCleanup(() => {
      dispose()
    })
  }, { immediate: true })

  function showImportDone(type: 'JSON' | 'CSV', count: number): void {
    ioMessage.value = `${type} 导入成功：已更新 ${count} 个字段`
  }

  function showImportError(error: unknown): void {
    const message = error instanceof Error ? error.message : String(error)
    ioMessage.value = `导入失败：${message}`
  }

  function showActionError(error: unknown): void {
    const message = error instanceof Error ? error.message : String(error)
    ioMessage.value = `操作失败：${message}`
  }

  function exportJson(): void {
    ioRuntime.value?.exportRuntime.downloadJSON({ filename: 'order-export.json' }).catch(showActionError)
  }

  function exportCsv(): void {
    ioRuntime.value?.exportRuntime.downloadCSV({ filename: 'order-export.csv' }).catch(showActionError)
  }

  function printForm(): void {
    ioRuntime.value?.printRuntime.print().catch(showActionError)
  }

  function openJsonImport(): void {
    jsonFileInput.value?.click()
  }

  function openCsvImport(): void {
    csvFileInput.value?.click()
  }

  async function onJsonFileChange(event: Event): Promise<void> {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    target.value = ''
    if (!file || !ioRuntime.value)
      return
    try {
      const [raw, result] = await Promise.all([
        file.text(),
        ioRuntime.value.importRuntime.parseImportJSONFile(file, { strategy: importStrategy.value }),
      ])
      importPreview.value = {
        type: 'JSON',
        raw,
        data: result.data,
        appliedKeys: result.appliedKeys,
        skippedKeys: result.skippedKeys,
      }
      ioMessage.value = `JSON 解析完成：可导入 ${result.appliedKeys.length} 个字段`
    }
    catch (error) {
      showImportError(error)
    }
  }

  async function onCsvFileChange(event: Event): Promise<void> {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    target.value = ''
    if (!file || !ioRuntime.value)
      return
    try {
      const [raw, result] = await Promise.all([
        file.text(),
        ioRuntime.value.importRuntime.parseImportCSVFile(file, { strategy: importStrategy.value }),
      ])
      importPreview.value = {
        type: 'CSV',
        raw,
        data: result.data,
        appliedKeys: result.appliedKeys,
        skippedKeys: result.skippedKeys,
      }
      ioMessage.value = `CSV 解析完成：可导入 ${result.appliedKeys.length} 个字段`
    }
    catch (error) {
      showImportError(error)
    }
  }

  function applyImportPreview(): void {
    if (!ioRuntime.value || !importPreview.value)
      return
    try {
      const result = ioRuntime.value.importRuntime.applyImport(importPreview.value.data, { strategy: importStrategy.value })
      showImportDone(importPreview.value.type, result.appliedKeys.length)
      importPreview.value = null
    }
    catch (error) {
      showImportError(error)
    }
  }

  function clearImportPreview(): void {
    importPreview.value = null
  }

  const plugins = computed<FormPlugin[]>(() => ioRuntime.value?.plugins ?? [])

  return {
    ioRuntime,
    ioMessage,
    exportJsonPreview,
    exportCsvPreview,
    importStrategy,
    importPreview,
    jsonFileInput,
    csvFileInput,
    exportJson,
    exportCsv,
    printForm,
    openJsonImport,
    openCsvImport,
    onJsonFileChange,
    onCsvFileChange,
    applyImportPreview,
    clearImportPreview,
    plugins,
  }
}
