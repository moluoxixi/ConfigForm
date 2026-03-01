/// <reference path="../jsoneditor.d.ts" />
import type { FormImportJSONOptions, ImportSetValueStrategy } from '@moluoxixi/plugin-import'
import type { PropType, VNodeRef } from 'vue'
import { useForm } from '@moluoxixi/vue'
import { Alert as AAlert, Button as AButton, Modal as AModal, Upload as AUpload, message } from 'ant-design-vue'
import JSONEditor from 'jsoneditor'
import { computed, defineComponent, h, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import 'jsoneditor/dist/jsoneditor.css'

const DEFAULT_STRATEGY: ImportSetValueStrategy = 'merge'
const STRATEGY_OPTIONS: ImportSetValueStrategy[] = ['merge', 'shallow', 'replace']

export interface ImportJsonActionMessage {
  tone: 'info' | 'success' | 'error'
  text: string
}

export interface ImportJsonActionProps {
  buttonText?: string
  sourceTitle?: string
  sourceDescription?: string
  previewTitle?: string
  previewDescription?: string
  confirmText?: string
  cancelText?: string
  showStrategy?: boolean
  strategy?: ImportSetValueStrategy
  defaultStrategy?: ImportSetValueStrategy
  importOptions?: Omit<FormImportJSONOptions, 'strategy'>
}

export const ImportJsonAction = defineComponent({
  name: 'CfImportJsonAction',
  props: {
    buttonText: { type: String, default: '导入 JSON' },
    sourceTitle: { type: String, default: '选择导入 JSON 文件' },
    sourceDescription: { type: String, default: '请选择一个 `.json` 文件，解析后会进入可编辑预览弹窗。' },
    previewTitle: { type: String, default: '导入 JSON 预览（可编辑）' },
    previewDescription: { type: String, default: '可在弹窗内直接编辑 JSON，确认后会按当前导入策略写入表单。' },
    confirmText: { type: String, default: '应用导入' },
    cancelText: { type: String, default: '取消' },
    showStrategy: { type: Boolean, default: true },
    strategy: { type: String as PropType<ImportSetValueStrategy>, default: undefined },
    defaultStrategy: { type: String as PropType<ImportSetValueStrategy>, default: DEFAULT_STRATEGY },
    importOptions: { type: Object as PropType<Omit<FormImportJSONOptions, 'strategy'>>, default: undefined },
  },
  setup(props) {
    const form = useForm()
    const sourceOpen = ref(false)
    const previewOpen = ref(false)
    const previewData = ref<Record<string, unknown> | null>(null)
    const internalStrategy = ref<ImportSetValueStrategy>(props.defaultStrategy ?? DEFAULT_STRATEGY)
    const errorMessage = ref('')
    const editorHost = ref<HTMLDivElement | null>(null)
    let editor: JSONEditor | null = null

    const activeStrategy = computed(() => props.strategy ?? internalStrategy.value)
    const parseOptions = computed<FormImportJSONOptions>(() => ({
      ...(props.importOptions ?? {}),
      strategy: activeStrategy.value,
    }))

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
          mode: 'code',
          mainMenuBar: false,
          navigationBar: false,
          statusBar: false,
        })
      }
      if (previewData.value) {
        editor.set(previewData.value)
      }
    }

    const destroyEditor = (): void => {
      editor?.destroy()
      editor = null
    }

    watch(previewOpen, (value) => {
      errorMessage.value = ''
      if (value) {
        void setupEditor()
        return
      }
      destroyEditor()
    })

    onBeforeUnmount(() => {
      destroyEditor()
    })

    const handleParseFile = async (file: File): Promise<void> => {
      try {
        const parseImportJSONFile = form.parseImportJSONFile
        if (!parseImportJSONFile) {
          throw new Error('importPlugin is not installed.')
        }
        const parsed = await parseImportJSONFile(file, parseOptions.value)
        previewData.value = parsed.data
        previewOpen.value = true
        sourceOpen.value = false
        message.info(`JSON 解析完成：可导入 ${parsed.appliedKeys.length} 个字段`)
      }
      catch (error) {
        const text = error instanceof Error ? error.message : String(error)
        message.error(`导入失败：${text}`)
      }
    }

    const readEditorData = (): Record<string, unknown> | null => {
      if (!editor) {
        return previewData.value
      }
      try {
        const data = editor.get() as Record<string, unknown>
        return data
      }
      catch (error) {
        const text = error instanceof Error ? error.message : String(error)
        errorMessage.value = text
        message.error(`JSON 解析失败：${text}`)
        return null
      }
    }

    const confirmImport = async (): Promise<void> => {
      try {
        const data = readEditorData()
        if (!data) {
          return
        }
        const applyImport = form.applyImport ?? form.importJSON
        if (!applyImport) {
          throw new Error('importPlugin is not installed.')
        }
        const applied = applyImport(data, {
          ...(props.importOptions ?? {}),
          strategy: activeStrategy.value,
        })
        previewData.value = data
        previewOpen.value = false
        message.success(`JSON 导入成功：已更新 ${applied.appliedKeys.length} 个字段`)
      }
      catch (error) {
        const text = error instanceof Error ? error.message : String(error)
        errorMessage.value = text
        message.error(`导入失败：${text}`)
      }
    }

    const renderStrategy = (): ReturnType<typeof h> => h('label', {
      style: 'font-size: 12px; color: #475569; display: inline-flex; align-items: center; gap: 6px',
    }, [
      h('span', null, '导入策略'),
      h('select', {
        value: activeStrategy.value,
        onChange: (event: Event) => {
          const target = event.target as HTMLSelectElement
          internalStrategy.value = target.value as ImportSetValueStrategy
        },
        style: 'border: 1px solid #d0d7de; border-radius: 6px; padding: 4px 8px;',
      }, STRATEGY_OPTIONS.map(option => h('option', { value: option }, option))),
    ])

    const renderSourceModal = (): ReturnType<typeof h> => {
      const DraggerComponent = (AUpload as any).Dragger as Component
      return h(AModal, {
        title: props.sourceTitle,
        open: sourceOpen.value,
        footer: null,
        destroyOnClose: true,
        onCancel: () => {
          sourceOpen.value = false
        },
      }, {
        default: () => [
          h('div', { style: { marginBottom: '12px', fontSize: '12px', color: '#64748b' } }, props.sourceDescription),
          h(DraggerComponent, {
            accept: '.json,application/json',
            multiple: false,
            showUploadList: false,
            beforeUpload: (file: File) => {
              void handleParseFile(file)
              return false
            },
          }, {
            default: () => h('div', null, [
              h('p', { style: { margin: 0, fontWeight: 600, color: '#334155' } }, '点击或拖拽 JSON 文件到此处'),
            ]),
          }),
        ],
      })
    }

    const renderPreviewModal = (): ReturnType<typeof h> => {
      const editorView = h('div', {
        ref: editorHostRef,
        style: { minHeight: '420px', overflow: 'auto' },
      })

      const errorView = errorMessage.value
        ? h('p', { style: { color: '#be123c', fontSize: '12px', margin: '8px 0 0' } }, errorMessage.value)
        : null

      return h(AModal, {
        title: props.previewTitle,
        open: previewOpen.value,
        width: 960,
        okText: props.confirmText,
        cancelText: props.cancelText,
        destroyOnClose: true,
        onCancel: () => {
          previewOpen.value = false
        },
        onOk: () => {
          void confirmImport()
        },
      }, {
        default: () => [
          h(AAlert, {
            type: 'info',
            showIcon: true,
            message: props.previewDescription,
            style: { marginBottom: '12px' },
          }),
          editorView,
          errorView,
        ],
      })
    }

    return () => h('div', null, [
      h('div', {
        style: {
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          flexWrap: 'wrap',
        },
      }, [
        h(AButton, { onClick: () => { sourceOpen.value = true } }, () => props.buttonText),
        props.showStrategy ? renderStrategy() : null,
      ]),
      renderSourceModal(),
      renderPreviewModal(),
    ])
  },
})
