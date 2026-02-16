import type { FormInstance, FormPlugin } from '@moluoxixi/core'
import type {
  FormExportPluginAPI,
  FormExportPluginOptions,
  FormExportPreview,
  FormExportPreviewOptions,
} from './types'
import { cloneWithoutKeyPrefixes, FormLifeCycle, isPlainObject } from '@moluoxixi/core'
import { browserDownload } from './browser'

export const PLUGIN_NAME = 'form-export'

const DEFAULT_EXCLUDE_PREFIXES = ['_']
const DEFAULT_JSON_SPACE = 2
const DEFAULT_FILE_NAME_BASE = 'config-form'

function toExportData(values: Record<string, unknown>, excludePrefixes: string[]): Record<string, unknown> {
  const cloned = cloneWithoutKeyPrefixes(values, excludePrefixes)
  return isPlainObject(cloned) ? cloned : {}
}

function resolveExcludePrefixes(config: FormExportPluginOptions, options?: { excludePrefixes?: string[] }): string[] {
  return options?.excludePrefixes ?? config.excludePrefixes ?? DEFAULT_EXCLUDE_PREFIXES
}

function resolveFileNameBase(config: FormExportPluginOptions): string {
  const base = typeof config.filenameBase === 'function' ? config.filenameBase() : config.filenameBase
  return base || DEFAULT_FILE_NAME_BASE
}

function createExportPreview(
  api: Pick<FormExportPluginAPI, 'getExportData'>,
  config: FormExportPluginOptions,
  options: FormExportPreviewOptions = {},
): FormExportPreview {
  const data = api.getExportData(options)
  return {
    data,
    json: JSON.stringify(data, null, options.jsonSpace ?? config.jsonSpace ?? DEFAULT_JSON_SPACE),
  }
}

export function exportPlugin(config: FormExportPluginOptions = {}): FormPlugin<FormExportPluginAPI> {
  return {
    name: PLUGIN_NAME,
    install(form: FormInstance) {
      const formWithExport = form as FormInstance & {
        getExportData?: FormExportPluginAPI['getExportData']
        getExportPreview?: FormExportPluginAPI['getExportPreview']
        subscribeExportPreview?: FormExportPluginAPI['subscribeExportPreview']
        exportJSON?: FormExportPluginAPI['exportJSON']
        downloadJSON?: FormExportPluginAPI['downloadJSON']
      }

      const previewSubscribers = new Map<(preview: FormExportPreview) => void, FormExportPreviewOptions | undefined>()
      let previewNotifyScheduled = false
      const api: FormExportPluginAPI = {
        getExportData(options) {
          const excludePrefixes = resolveExcludePrefixes(config, options)
          return toExportData(form.values as Record<string, unknown>, excludePrefixes)
        },

        getExportPreview(options) {
          return createExportPreview(api, config, options)
        },

        subscribeExportPreview(listener, options) {
          previewSubscribers.set(listener, options)
          listener(api.getExportPreview(options))
          return () => {
            previewSubscribers.delete(listener)
          }
        },

        exportJSON(options) {
          const data = api.getExportData(options)
          const space = options?.space ?? config.jsonSpace ?? DEFAULT_JSON_SPACE
          return JSON.stringify(data, null, space)
        },

        async downloadJSON(options) {
          const download = config.adapters?.download ?? browserDownload
          const content = api.exportJSON(options)
          const filename = options?.filename ?? `${resolveFileNameBase(config)}.json`
          await Promise.resolve(download({
            filename,
            mimeType: 'application/json;charset=utf-8',
            content,
          }))
        },
      }

      const notifyExportPreviewSubscribers = (): void => {
        for (const [listener, options] of previewSubscribers.entries()) {
          listener(api.getExportPreview(options))
        }
      }

      const scheduleNotifyExportPreviewSubscribers = (): void => {
        if (previewNotifyScheduled) {
          return
        }
        previewNotifyScheduled = true

        const flush = (): void => {
          previewNotifyScheduled = false
          notifyExportPreviewSubscribers()
        }

        if (typeof queueMicrotask === 'function') {
          queueMicrotask(flush)
        }
        else {
          Promise.resolve().then(flush)
        }
      }

      const disposeValues = form.onValuesChange(() => {
        scheduleNotifyExportPreviewSubscribers()
      })
      const disposeReset = form.on(FormLifeCycle.ON_FORM_RESET, () => {
        scheduleNotifyExportPreviewSubscribers()
      })
      const disposeMount = form.on(FormLifeCycle.ON_FORM_MOUNT, () => {
        scheduleNotifyExportPreviewSubscribers()
      })

      formWithExport.getExportData = api.getExportData
      formWithExport.getExportPreview = api.getExportPreview
      formWithExport.subscribeExportPreview = api.subscribeExportPreview
      formWithExport.exportJSON = api.exportJSON
      formWithExport.downloadJSON = api.downloadJSON

      return {
        api,
        dispose() {
          if (formWithExport.getExportData === api.getExportData)
            delete formWithExport.getExportData
          if (formWithExport.getExportPreview === api.getExportPreview)
            delete formWithExport.getExportPreview
          if (formWithExport.subscribeExportPreview === api.subscribeExportPreview)
            delete formWithExport.subscribeExportPreview
          if (formWithExport.exportJSON === api.exportJSON)
            delete formWithExport.exportJSON
          if (formWithExport.downloadJSON === api.downloadJSON)
            delete formWithExport.downloadJSON
          previewSubscribers.clear()
          previewNotifyScheduled = false
          disposeValues()
          disposeReset()
          disposeMount()
        },
      }
    },
  }
}
