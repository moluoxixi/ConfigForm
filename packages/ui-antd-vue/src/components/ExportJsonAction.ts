/// <reference path="../jsoneditor.d.ts" />
import type { FormExportDownloadJSONOptions, FormExportPreviewOptions } from '@moluoxixi/plugin-export'
import type { PropType, VNode, VNodeRef } from 'vue'
import { useForm } from '@moluoxixi/vue'
import { Alert as AAlert, Button as AButton, Modal as AModal, message } from 'ant-design-vue'
import JSONEditor from 'jsoneditor'
import { defineComponent, h, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import 'jsoneditor/dist/jsoneditor.css'

export interface ExportJsonActionMessage {
  tone: 'info' | 'success' | 'error'
  text: string
}

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
  setup(props, { emit }) {
    const form = useForm()
    const open = ref(false)
    const previewData = ref<Record<string, unknown>>({})
    const editorHost = ref<HTMLDivElement | null>(null)
    const editorRef = ref<JSONEditor | null>(null)
    const errorMessage = ref('')

    function notify(tone: 'info' | 'success' | 'error', text: string): void {
      const api = message[tone] as ((content: string) => void) | undefined
      api?.(text)
      emit('message', { tone, text } satisfies ExportJsonActionMessage)
    }

    function destroyEditor(): void {
      editorRef.value?.destroy()
      editorRef.value = null
    }

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
        onEditable: () => false,
      })
      setEditorValue(previewData.value)
    }

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

    const renderPreviewModal = (): VNode => {
      const editorHostRef: VNodeRef = (el) => {
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
        onCancel: () => {
          open.value = false
        },
        onOk: () => {
          void confirmDownload()
        },
      }, {
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
      h(AButton, { type: 'primary', onClick: () => { open.value = true } }, () => props.buttonText),
      renderPreviewModal(),
    ])
  },
})
