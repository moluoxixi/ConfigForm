/// <reference path="../jsoneditor.d.ts" />
import type { FormExportDownloadJSONOptions, FormExportPreviewOptions } from '@moluoxixi/plugin-export'
import type { PropType, VNode, VNodeRef } from 'vue'
import { useForm } from '@moluoxixi/vue'
import { Alert as AAlert, Button as AButton, Modal as AModal, message } from 'ant-design-vue'
import JSONEditor from 'jsoneditor'
import { defineComponent, h, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import 'jsoneditor/dist/jsoneditor.css'

/**
 * ExportJsonActionMessage??????
 * ???`packages/ui-antd-vue/src/components/ExportJsonAction.ts:10`?
 * ??????????????????????????????
 */
export interface ExportJsonActionMessage {
  tone: 'info' | 'success' | 'error'
  text: string
}

/**
 * ExportJsonActionProps??????
 * ???`packages/ui-antd-vue/src/components/ExportJsonAction.ts:15`?
 * ??????????????????????????????
 */
export interface ExportJsonActionProps {
  buttonText?: string
  modalTitle?: string
  description?: string
  confirmText?: string
  cancelText?: string
  filename?: string
  previewOptions?: FormExportPreviewOptions
  downloadOptions?: Omit<FormExportDownloadJSONOptions, 'filename'>
}

/**
 * is Record：负责“判断is Record”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 is Record 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export const ExportJsonAction = defineComponent({
  name: 'CfAntdExportJsonAction',
  props: {
    buttonText: { type: String, default: '导出预览' },
    modalTitle: { type: String, default: '导出 JSON 预览' },
    description: { type: String, default: '当前表单值的 JSON 预览。点击“下载 JSON”导出文件。' },
    confirmText: { type: String, default: '下载 JSON' },
    cancelText: { type: String, default: '取消' },
    filename: { type: String, default: 'order-export.json' },
    previewOptions: { type: Object as PropType<ExportJsonActionProps['previewOptions']>, default: undefined },
    downloadOptions: { type: Object as PropType<ExportJsonActionProps['downloadOptions']>, default: undefined },
  },
  emits: ['message'],
  /**
   * setup：处理当前分支的交互与状态同步。
   * 功能：处理参数消化、状态变更与调用链行为同步。
   * @param props 参数 props 为当前功能所需的输入信息。
   * @returns 返回当前分支执行后的处理结果。
   */
  setup(props, { emit }) {
    const form = useForm()
    const open = ref(false)
    const previewData = ref<Record<string, unknown>>({})
    const editorHost = ref<HTMLDivElement | null>(null)
    const editorRef = ref<JSONEditor | null>(null)
    const errorMessage = ref('')

    /**
     * notify：负责编排该能力的主流程。
     * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
     * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
     *
     * 说明：该函数聚焦于 notify 的单一职责，调用方可通过函数名快速理解输入输出语义。
     */
    function notify(tone: 'info' | 'success' | 'error', text: string): void {
      const api = message[tone] as ((content: string) => void) | undefined
      api?.(text)
      emit('message', { tone, text } satisfies ExportJsonActionMessage)
    }

    /**
     * destroy Editor：负责编排该能力的主流程。
     * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
     * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
     *
     * 说明：该函数聚焦于 destroy Editor 的单一职责，调用方可通过函数名快速理解输入输出语义。
     */
    function destroyEditor(): void {
      editorRef.value?.destroy()
      editorRef.value = null
    }

    /**
     * set Editor Value：负责“设置set Editor Value”的核心实现与调用衔接。
     * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
     * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
     *
     * 说明：该注释描述 set Editor Value 的主要职责边界，便于维护者快速理解函数在链路中的定位。
     */
    function setEditorValue(value: Record<string, unknown>): void {
      const editor = editorRef.value
      if (!editor) {
        return
      }
      try {
        editor.set(value)
      }
      catch {
        editor.set({})
      }
    }

    /**
     * mountEditor：处理当前分支的交互与状态同步。
     * 功能：处理参数消化、状态变更与调用链行为同步。
     */
    async function mountEditor(): Promise<void> {
      await nextTick()
      if (!editorHost.value) {
        return
      }
      destroyEditor()
      editorRef.value = new JSONEditor(editorHost.value, {
        mode: 'view',
        modes: ['view', 'code'],
        mainMenuBar: true,
        navigationBar: true,
        statusBar: true,
        search: true,
        /**
         * onEditable：处理当前分支的交互与状态同步。
         * 功能：处理参数消化、状态变更与调用链行为同步。
         * @returns 返回当前分支执行后的处理结果。
         */
        onEditable: () => false,
      })
      setEditorValue(previewData.value)
    }

    /**
     * confirmDownload：处理当前分支的交互与状态同步。
     * 功能：处理参数消化、状态变更与调用链行为同步。
     */
    async function confirmDownload(): Promise<void> {
      try {
        const downloadJSON = form.downloadJSON
        if (!downloadJSON) {
          throw new Error('exportPlugin is not installed.')
        }
        await downloadJSON({
          ...props.downloadOptions,
          filename: props.filename,
        })
        notify('success', 'JSON 导出成功')
        open.value = false
      }
      catch (error) {
        const text = error instanceof Error ? error.message : String(error)
        notify('error', `导出失败：${text}`)
      }
    }

    watch(
      () => props.previewOptions,
      (previewOptions, _prev, onCleanup) => {
        const subscribeExportPreview = form.subscribeExportPreview
        if (!subscribeExportPreview) {
          previewData.value = {}
          return
        }
        const dispose = subscribeExportPreview((preview) => {
          previewData.value = isRecord(preview.data) ? preview.data : {}
        }, previewOptions)
        onCleanup(() => {
          dispose()
        })
      },
      { immediate: true },
    )

    watch(open, async (value) => {
      if (value) {
        await mountEditor()
      }
      else {
        destroyEditor()
        errorMessage.value = ''
      }
    }, { immediate: true })

    watch(previewData, (value) => {
      if (!open.value) {
        return
      }
      setEditorValue(value)
    }, { deep: true })

    onBeforeUnmount(() => {
      destroyEditor()
    })

    /**
     * renderPreviewModal?????????????????
     * ???`packages/ui-antd-vue/src/components/ExportJsonAction.ts:213`?
     * ?????????????????????????????????
     * ??????????????????????????
     * @returns ?????????????
     */
    const /**
           * renderPreviewModal：处理当前分支的交互与状态同步。
           * 功能：处理参数消化、状态变更与调用链行为同步。
           * @returns 返回当前分支执行后的处理结果。
           */
      renderPreviewModal = (): VNode => {
        /**
         * editorHostRef?????????????????
         * ???`packages/ui-antd-vue/src/components/ExportJsonAction.ts:221`?
         * ?????????????????????????????????
         * ??????????????????????????
         * @param el ?? el ????????????
         */
        const /**
               * editorHostRef：处理当前分支的交互与状态同步。
               * 功能：处理参数消化、状态变更与调用链行为同步。
               * @param el 参数 el 为当前功能所需的输入信息。
               */
          editorHostRef: VNodeRef = (el) => {
            editorHost.value = el as HTMLDivElement | null
          }

        const editorView = h('div', {
          ref: editorHostRef,
          style: { minHeight: '420px', overflow: 'auto' },
        })

        const errorView = errorMessage.value
          ? h('p', { style: { color: '#be123c', fontSize: '12px', margin: '8px 0 0' } }, errorMessage.value)
          : null

        return h(AModal, {
          title: props.modalTitle,
          open: open.value,
          width: 960,
          okText: props.confirmText,
          cancelText: props.cancelText,
          destroyOnClose: true,
          /**
           * onCancel：处理当前分支的交互与状态同步。
           * 功能：处理参数消化、状态变更与调用链行为同步。
           */
          onCancel: () => {
            open.value = false
          },
          /**
           * onOk：处理当前分支的交互与状态同步。
           * 功能：处理参数消化、状态变更与调用链行为同步。
           */
          onOk: () => {
            void confirmDownload()
          },
        }, {
          /**
           * default：处理当前分支的交互与状态同步。
           * 功能：处理参数消化、状态变更与调用链行为同步。
           * @returns 返回当前分支执行后的处理结果。
           */
          default: () => [
            h(AAlert, {
              type: 'info',
              showIcon: true,
              message: props.description,
              style: { marginBottom: '12px' },
            }),
            editorView,
            errorView,
          ],
        })
      }

    return () => h('div', null, [
      h(AButton, { type: 'primary', /**
                                     * onClick：处理当前分支的交互与状态同步。
                                     * 功能：处理参数消化、状态变更与调用链行为同步。
                                     */
        /**
         * onClick：处理当前分支的交互与状态同步。
         * 功能：处理参数消化、状态变更与调用链行为同步。
         */
        onClick: () => { open.value = true } }, () => props.buttonText),
      renderPreviewModal(),
    ])
  },
})
