/// <reference path="../jsoneditor.d.ts" />
import type { FormExportDownloadJSONOptions, FormExportPreviewOptions } from '@moluoxixi/plugin-export'
import type { PropType, VNodeRef } from 'vue'
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

export const ExportJsonAction = defineComponent({
  name: 'CfExportJsonAction',
  props: {
    buttonText: { type: String, default: '导出预览' },
    modalTitle: { type: String, default: '导出 JSON 预览' },
    description: { type: String, default: '当前表单值的 JSON 预览。点击“下载 JSON”导出文件。' },
    confirmText: { type: String, default: '下载 JSON' },
    cancelText: { type: String, default: '关闭' },
    filename: { type: String, default: 'form-export.json' },
    previewOptions: { type: Object as PropType<FormExportPreviewOptions>, default: undefined },
    downloadOptions: { type: Object as PropType<Omit<FormExportDownloadJSONOptions, 'filename'>>, default: undefined },
  },
  setup(props) {
    const form = useForm()
    const open = ref(false)
    const previewData = ref<Record<string, unknown>>({})
    const editorHost = ref<HTMLDivElement | null>(null)
    let editor: JSONEditor | null = null

    const editorHostRef: VNodeRef = (el) => {
      editorHost.value = el as HTMLDivElement | null
    }

    const setupEditor = async (): Promise<void> => {
      await nextTick()
      if (!editorHost.value) {
        return
      }
      if (!editor) {
        editor = new JSONEditor(editorHost.value, {
          mode: 'view',
          mainMenuBar: false,
          navigationBar: false,
          statusBar: false,
        })
      }
      editor.set(previewData.value)
    }

    const destroyEditor = (): void => {
      editor?.destroy()
      editor = null
    }

    const unsubscribe = form.subscribeExportPreview?.((preview) => {
      previewData.value = preview.data
      if (editor) {
        editor.set(preview.data)
      }
    }, props.previewOptions)

    watch(open, (value) => {
      if (value) {
        void setupEditor()
        return
      }
      destroyEditor()
    })

    onBeforeUnmount(() => {
      destroyEditor()
      unsubscribe?.()
    })

    const confirmDownload = async (): Promise<void> => {
      try {
        const downloadJSON = form.downloadJSON
        if (!downloadJSON) {
          throw new Error('exportPlugin is not installed.')
        }
        await downloadJSON({
          ...props.downloadOptions,
          filename: props.filename,
        })
        message.success('JSON 导出成功')
        open.value = false
      }
      catch (error) {
        const text = error instanceof Error ? error.message : String(error)
        message.error(`导出失败：${text}`)
      }
    }

    const renderPreviewModal = (): ReturnType<typeof h> => {
      const editorView = h('div', {
        ref: editorHostRef,
        style: { minHeight: '420px', overflow: 'auto' },
      })

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
        ],
      })
    }

    return () => h('div', null, [
      h(AButton, { type: 'primary', onClick: () => { open.value = true } }, () => props.buttonText),
      renderPreviewModal(),
    ])
  },
})
