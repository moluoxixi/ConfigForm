import type { FormInstance, FormPlugin } from '@moluoxixi/core'
import type {
  FormExportDataOptions,
  FormExportPluginAPI,
  FormExportPluginOptions,
  FormExportPreview,
  FormExportPreviewOptions,
} from './types'
import { FormLifeCycle } from '@moluoxixi/core'
import { browserDownload } from './browser'

export const PLUGIN_NAME = 'form-export'

const _DEFAULT_EXCLUDE_PREFIXES = ['_']
const DEFAULT_JSON_SPACE = 2
const DEFAULT_FILE_NAME_BASE = 'config-form'

/**
 * resolveExcludePrefixes：合并插件级与调用级的排除前缀配置。
 */
function resolveExcludePrefixes(
  config: FormExportPluginOptions,
  options?: FormExportDataOptions,
): string[] {
  return options?.excludePrefixes ?? config.excludePrefixes ?? _DEFAULT_EXCLUDE_PREFIXES
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * 深拷贝并按前缀过滤对象 key。
 */
function sanitizeValue(value: unknown, excludePrefixes: string[]): unknown {
  if (Array.isArray(value)) {
    return value.map(item => sanitizeValue(item, excludePrefixes))
  }
  if (!isRecord(value)) {
    return value
  }

  const next: Record<string, unknown> = {}
  for (const [key, item] of Object.entries(value)) {
    if (excludePrefixes.some(prefix => prefix && key.startsWith(prefix))) {
      continue
    }
    next[key] = sanitizeValue(item, excludePrefixes)
  }
  return next
}

/**
 * toExportData：按配置生成可导出的纯数据对象。
 */
function toExportData(values: Record<string, unknown>, excludePrefixes: string[]): Record<string, unknown> {
  const sanitized = sanitizeValue(values, excludePrefixes)
  return isRecord(sanitized) ? sanitized : {}
}

/**
 * createExportPreview：生成导出预览（对象 + JSON 字符串）。
 */
function createExportPreview(
  api: FormExportPluginAPI,
  config: FormExportPluginOptions,
  options?: FormExportPreviewOptions,
): FormExportPreview {
  const data = api.getExportData(options)
  const space = options?.jsonSpace ?? config.jsonSpace ?? DEFAULT_JSON_SPACE
  return {
    data,
    json: JSON.stringify(data, null, space),
  }
}

/**
 * resolveFileNameBase：处理当前分支的交互与状态同步。
 * 功能：完成参数消化、业务分支处理及上下游结果传递。
 * @param config 参数 config 为当前逻辑所需的输入信息。
 * @returns 返回当前分支执行后的结果。
 */
function resolveFileNameBase(config: FormExportPluginOptions): string {
  const base = typeof config.filenameBase === 'function' ? config.filenameBase() : config.filenameBase
  return base || DEFAULT_FILE_NAME_BASE
}

/**
 * exportPlugin：处理当前分支的交互与状态同步。
 * 功能：完成参数消化、业务分支处理及上下游结果传递。
 * @param config 参数 config 为当前逻辑所需的输入信息。
 * @returns 返回当前分支执行后的结果。
 */
export function exportPlugin(config: FormExportPluginOptions = {}): FormPlugin<FormExportPluginAPI> {
  return {
    name: PLUGIN_NAME,

    /**
     * install：处理当前分支的交互与状态同步。
     * 功能：完成参数消化、业务分支处理及上下游结果传递。
     * @param form 参数 form 为业务实体对象，用于读写状态或属性。
     * @returns 返回当前分支执行后的结果。
     */
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

        /**
         * getExportData：处理当前分支的交互与状态同步。
         * 功能：完成参数消化、业务分支处理及上下游结果传递。
         * @param options 参数 options 为当前逻辑所需的输入信息。
         * @returns 返回当前分支执行后的结果。
         */
        getExportData(options) {
          const excludePrefixes = resolveExcludePrefixes(config, options)
          return toExportData(form.values as Record<string, unknown>, excludePrefixes)
        },

        /**
         * getExportPreview：处理当前分支的交互与状态同步。
         * 功能：完成参数消化、业务分支处理及上下游结果传递。
         * @param options 参数 options 为当前逻辑所需的输入信息。
         * @returns 返回当前分支执行后的结果。
         */
        getExportPreview(options) {
          return createExportPreview(api, config, options)
        },

        /**
         * subscribeExportPreview：处理当前分支的交互与状态同步。
         * 功能：完成参数消化、业务分支处理及上下游结果传递。
         * @param listener 参数 listener 为当前逻辑所需的输入信息。
         * @param options 参数 options 为当前逻辑所需的输入信息。
         * @returns 返回当前分支执行后的结果。
         */
        subscribeExportPreview(listener, options) {
          previewSubscribers.set(listener, options)
          listener(api.getExportPreview(options))
          return () => {
            previewSubscribers.delete(listener)
          }
        },

        /**
         * exportJSON：处理当前分支的交互与状态同步。
         * 功能：完成参数消化、业务分支处理及上下游结果传递。
         * @param options 参数 options 为当前逻辑所需的输入信息。
         * @returns 返回当前分支执行后的结果。
         */
        exportJSON(options) {
          const data = api.getExportData(options)
          const space = options?.space ?? config.jsonSpace ?? DEFAULT_JSON_SPACE
          return JSON.stringify(data, null, space)
        },

        /**
         * downloadJSON：处理当前分支的交互与状态同步。
         * 功能：完成参数消化、业务分支处理及上下游结果传递。
         * @param options 参数 options 为当前逻辑所需的输入信息。
         */
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

      /**
       * notifyExportPreviewSubscribers?????????????????
       * ???`packages/plugin-export/src/plugin.ts:145`?
       * ?????????????????????????????????
       * ??????????????????????????
       */
      const
        /**
         * notifyExportPreviewSubscribers：处理当前分支的交互与状态同步。
         * 功能：完成参数消化、业务分支处理及上下游结果传递。
         */
        notifyExportPreviewSubscribers = (): void => {
          for (const [listener, options] of previewSubscribers.entries()) {
            listener(api.getExportPreview(options))
          }
        }

      /**
       * scheduleNotifyExportPreviewSubscribers?????????????????
       * ???`packages/plugin-export/src/plugin.ts:158`?
       * ?????????????????????????????????
       * ??????????????????????????
       */
      const
        /**
         * scheduleNotifyExportPreviewSubscribers：处理当前分支的交互与状态同步。
         * 功能：完成参数消化、业务分支处理及上下游结果传递。
         */
        scheduleNotifyExportPreviewSubscribers = (): void => {
          if (previewNotifyScheduled) {
            return
          }
          previewNotifyScheduled = true

          /**
           * flush?????????????????
           * ???`packages/plugin-export/src/plugin.ts:171`?
           * ?????????????????????????????????
           * ??????????????????????????
           */
          const
            /**
             * flush：处理当前分支的交互与状态同步。
             * 功能：完成参数消化、业务分支处理及上下游结果传递。
             */
            flush = (): void => {
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

        /**
         * dispose：处理当前分支的交互与状态同步。
         * 功能：完成参数消化、业务分支处理及上下游结果传递。
         */
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
