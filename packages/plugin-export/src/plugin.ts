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

const _DEFAULT_EXCLUDE_PREFIXES = ['_']
const DEFAULT_JSON_SPACE = 2
const DEFAULT_FILE_NAME_BASE = 'config-form'

/**
 * resolveFileNameBase：执行当前位置的功能处理逻辑。
 * 定位：`packages/plugin-export/src/plugin.ts:18`。
 * 功能：完成参数消化、业务分支处理及上下游结果传递。
 * 流程：先执行输入边界处理，再运行核心逻辑，最后返回或触发后续动作。
 * @param config 参数 config 为当前逻辑所需的输入信息。
 * @returns 返回当前分支执行后的结果。
 */
function resolveFileNameBase(config: FormExportPluginOptions): string {
  const base = typeof config.filenameBase === 'function' ? config.filenameBase() : config.filenameBase
  return base || DEFAULT_FILE_NAME_BASE
}

/**
 * exportPlugin：执行当前位置的功能处理逻辑。
 * 定位：`packages/plugin-export/src/plugin.ts:24`。
 * 功能：完成参数消化、业务分支处理及上下游结果传递。
 * 流程：先执行输入边界处理，再运行核心逻辑，最后返回或触发后续动作。
 * @param config 参数 config 为当前逻辑所需的输入信息。
 * @returns 返回当前分支执行后的结果。
 */
export function exportPlugin(config: FormExportPluginOptions = {}): FormPlugin<FormExportPluginAPI> {
  return {
    name: PLUGIN_NAME,

    /**
     * install：执行当前位置的功能处理逻辑。
     * 定位：`packages/plugin-export/src/plugin.ts:28`。
     * 功能：完成参数消化、业务分支处理及上下游结果传递。
     * 流程：先执行输入边界处理，再运行核心逻辑，最后返回或触发后续动作。
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
         * getExportData：执行当前位置的功能处理逻辑。
         * 定位：`packages/plugin-export/src/plugin.ts:41`。
         * 功能：完成参数消化、业务分支处理及上下游结果传递。
         * 流程：先执行输入边界处理，再运行核心逻辑，最后返回或触发后续动作。
         * @param options 参数 options 为当前逻辑所需的输入信息。
         * @returns 返回当前分支执行后的结果。
         */
        getExportData(options) {
          const excludePrefixes = resolveExcludePrefixes(config, options)
          return toExportData(form.values as Record<string, unknown>, excludePrefixes)
        },

        /**
         * getExportPreview：执行当前位置的功能处理逻辑。
         * 定位：`packages/plugin-export/src/plugin.ts:47`。
         * 功能：完成参数消化、业务分支处理及上下游结果传递。
         * 流程：先执行输入边界处理，再运行核心逻辑，最后返回或触发后续动作。
         * @param options 参数 options 为当前逻辑所需的输入信息。
         * @returns 返回当前分支执行后的结果。
         */
        getExportPreview(options) {
          return createExportPreview(api, config, options)
        },

        /**
         * subscribeExportPreview：执行当前位置的功能处理逻辑。
         * 定位：`packages/plugin-export/src/plugin.ts:52`。
         * 功能：完成参数消化、业务分支处理及上下游结果传递。
         * 流程：先执行输入边界处理，再运行核心逻辑，最后返回或触发后续动作。
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
         * exportJSON：执行当前位置的功能处理逻辑。
         * 定位：`packages/plugin-export/src/plugin.ts:61`。
         * 功能：完成参数消化、业务分支处理及上下游结果传递。
         * 流程：先执行输入边界处理，再运行核心逻辑，最后返回或触发后续动作。
         * @param options 参数 options 为当前逻辑所需的输入信息。
         * @returns 返回当前分支执行后的结果。
         */
        exportJSON(options) {
          const data = api.getExportData(options)
          const space = options?.space ?? config.jsonSpace ?? DEFAULT_JSON_SPACE
          return JSON.stringify(data, null, space)
        },

        /**
         * downloadJSON：执行当前位置的功能处理逻辑。
         * 定位：`packages/plugin-export/src/plugin.ts:68`。
         * 功能：完成参数消化、业务分支处理及上下游结果传递。
         * 流程：先执行输入边界处理，再运行核心逻辑，最后返回或触发后续动作。
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
         * notifyExportPreviewSubscribers：执行当前位置的功能处理逻辑。
         * 定位：`packages/plugin-export/src/plugin.ts:81`。
         * 功能：完成参数消化、业务分支处理及上下游结果传递。
         * 流程：先执行输入边界处理，再运行核心逻辑，最后返回或触发后续动作。
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
         * scheduleNotifyExportPreviewSubscribers：执行当前位置的功能处理逻辑。
         * 定位：`packages/plugin-export/src/plugin.ts:88`。
         * 功能：完成参数消化、业务分支处理及上下游结果传递。
         * 流程：先执行输入边界处理，再运行核心逻辑，最后返回或触发后续动作。
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
             * flush：执行当前位置的功能处理逻辑。
             * 定位：`packages/plugin-export/src/plugin.ts:95`。
             * 功能：完成参数消化、业务分支处理及上下游结果传递。
             * 流程：先执行输入边界处理，再运行核心逻辑，最后返回或触发后续动作。
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
         * dispose：执行当前位置的功能处理逻辑。
         * 定位：`packages/plugin-export/src/plugin.ts:127`。
         * 功能：完成参数消化、业务分支处理及上下游结果传递。
         * 流程：先执行输入边界处理，再运行核心逻辑，最后返回或触发后续动作。
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
