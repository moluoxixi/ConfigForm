/// <reference path="../jsoneditor.d.ts" />
import type { FormImportJSONOptions, ImportSetValueStrategy } from '@moluoxixi/plugin-import'
import type { PropType, VNode, VNodeRef } from 'vue'
import { useForm } from '@moluoxixi/vue'
import { Alert as AAlert, Button as AButton, Modal as AModal, message, Upload as AUpload } from 'ant-design-vue'
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function mergeApplyOptions(
  strategy: ImportSetValueStrategy,
  importOptions: ImportJsonActionProps['importOptions'],
): { strategy: ImportSetValueStrategy, allowInternal?: boolean, excludePrefixes?: string[] } {
  return {
    strategy,
    allowInternal: importOptions?.allowInternal,
    excludePrefixes: importOptions?.excludePrefixes,
  }
}

export const ImportJsonAction = defineComponent({
  name: 'CfAntdImportJsonAction',
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
    importOptions: { type: Object as PropType<ImportJsonActionProps['importOptions']>, default: undefined },
  },
  emits: ['update:strategy', 'message'],
  setup(props, { emit }) {
    const form = useForm()
    const sourceOpen = ref(false)
    const previewOpen = ref(false)
    const previewData = ref<Record<string, unknown> | null>(null)
    const errorMessage = ref('')
    const editorHost = ref<HTMLDivElement | null>(null)
    const editorRef = ref<JSONEditor | null>(null)
    const innerStrategy = ref<ImportSetValueStrategy>(props.defaultStrategy)
    const activeStrategy = computed<ImportSetValueStrategy>(() => props.strategy ?? innerStrategy.value)

    function notify(tone: 'info' | 'success' | 'error', text: string): void {
      const api = message[tone] as ((content: string) => void) | undefined
      api?.(text)
      emit('message', { tone, text } satisfies ImportJsonActionMessage)
    }

    function setStrategy(next: ImportSetValueStrategy): void {
      if (!props.strategy) {
        innerStrategy.value = next
      }
      emit('update:strategy', next)
    }

    function destroyEditor(): void {
      editorRef.value?.destroy()
      editorRef.value = null
    }

    function setEditorValue(value: Record<string, unknown> | null): void {
      const editor = editorRef.value
      if (!editor) {
        return
      }
      try {
        editor.set(value ?? {})
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
        mode: 'tree',
        modes: ['tree', 'code'],
        mainMenuBar: true,
        navigationBar: true,
        statusBar: true,
        search: true,
      })
      setEditorValue(previewData.value)
    }

    async function parseFile(file: File): Promise<void> {
      try {
        const parseImportJSONFile = form.parseImportJSONFile
        if (!parseImportJSONFile) {
          throw new Error('importPlugin is not installed.')
        }
        const parsed = await parseImportJSONFile(file, {
          ...props.importOptions,
          strategy: activeStrategy.value,
        })
        previewData.value = parsed.data
        sourceOpen.value = false
        previewOpen.value = true
        errorMessage.value = ''
        notify('info', `JSON 解析完成：可导入 ${parsed.appliedKeys.length} 个字段`)
      }
      catch (error) {
        const text = error instanceof Error ? error.message : String(error)
        notify('error', `导入失败：${text}`)
      }
    }

    async function confirmImport(): Promise<void> {
      const editor = editorRef.value
      if (!editor) {
        previewOpen.value = false
        return
      }

      try {
        const nextValue = editor.get()
        if (!isRecord(nextValue)) {
          throw new Error('JSON 根节点必须是对象')
        }
        const applyImport = form.applyImport
        if (!applyImport) {
          throw new Error('importPlugin is not installed.')
        }
        const applied = applyImport(nextValue, mergeApplyOptions(activeStrategy.value, props.importOptions))
        previewData.value = nextValue
        previewOpen.value = false
        errorMessage.value = ''
        notify('success', `JSON 导入成功：已更新 ${applied.appliedKeys.length} 个字段`)
      }
      catch (error) {
        errorMessage.value = error instanceof Error ? error.message : String(error)
      }
    }

    watch(previewOpen, async (open) => {
      if (open) {
        await mountEditor()
      }
      else {
        destroyEditor()
        errorMessage.value = ''
      }
    }, { immediate: true })

    watch(previewData, (value) => {
      if (!previewOpen.value) {
        return
      }
      setEditorValue(value)
    }, { deep: true })

    onBeforeUnmount(() => {
      destroyEditor()
    })

    function renderStrategy(): VNode {
      return h('label', {
        style: {
          fontSize: '12px',
          color: '#475569',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
        },
      }, [
        '导入策略',
        h('select', {
          value: activeStrategy.value,
          style: {
            border: '1px solid #d0d7de',
            borderRadius: '6px',
            padding: '4px 8px',
          },
          onChange: (event: Event) => {
            const value = (event.target as HTMLSelectElement).value as ImportSetValueStrategy
            setStrategy(value)
          },
        }, STRATEGY_OPTIONS.map(option => h('option', { key: option, value: option }, option))),
      ])
    }

    function renderSourceModal(): VNode {
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
          h('p', { style: { color: '#64748b', fontSize: '12px', margin: '0 0 12px' } }, props.sourceDescription),
          h(AUpload, {
            showUploadList: false,
            accept: '.json,application/json',
            beforeUpload: (file: File) => {
              void parseFile(file)
              return false
            },
          }, {
            default: () => h(AButton, {}, () => '选择 JSON 文件'),
          }),
        ],
      })
    }

    function renderPreviewModal(): VNode {
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
