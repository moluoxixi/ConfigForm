/// <reference path="../jsoneditor.d.ts" />
import type { FormImportJSONOptions, ImportSetValueStrategy } from '@moluoxixi/plugin-import'
import type { PropType, VNode, VNodeRef } from 'vue'
import { useForm } from '@moluoxixi/vue'
import { ElAlert, ElButton, ElDialog, ElMessage, ElUpload } from 'element-plus'
import JSONEditor from 'jsoneditor'
import { computed, defineComponent, h, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import 'jsoneditor/dist/jsoneditor.css'

const DEFAULT_STRATEGY: ImportSetValueStrategy = 'merge'
const STRATEGY_OPTIONS: ImportSetValueStrategy[] = ['merge', 'shallow', 'replace']

/**
 * ImportJsonActionMessage??????
 * ???`packages/ui-element-plus/src/components/ImportJsonAction.ts:13`?
 * ??????????????????????????????
 */
export interface ImportJsonActionMessage {
  tone: 'info' | 'success' | 'error'
  text: string
}

/**
 * ImportJsonActionProps??????
 * ???`packages/ui-element-plus/src/components/ImportJsonAction.ts:18`?
 * ??????????????????????????????
 */
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

/**
 * merge Apply Options：负责“合并merge Apply Options”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 merge Apply Options 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
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
  name: 'CfElementImportJsonAction',
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
  /**
   * setup：执行当前位置的功能逻辑。
   * 定位：`packages/ui-element-plus/src/components/ImportJsonAction.ts:77`。
   * 功能：处理参数消化、状态变更与调用链行为同步。
   * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
   * @param props 参数 props 为当前功能所需的输入信息。
   * @returns 返回当前分支执行后的处理结果。
   */
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

    /**
     * notify：负责该函数职责对应的主流程编排。
     * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
     * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
     *
     * 说明：该函数聚焦于 notify 的单一职责，调用方可通过函数名快速理解输入输出语义。
     */
    function notify(tone: 'info' | 'success' | 'error', text: string): void {
      ElMessage({ type: tone, message: text })
      emit('message', { tone, text } satisfies ImportJsonActionMessage)
    }

    /**
     * set Strategy：负责“设置set Strategy”的核心实现与调用衔接。
     * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
     * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
     *
     * 说明：该注释描述 set Strategy 的主要职责边界，便于维护者快速理解函数在链路中的定位。
     */
    function setStrategy(next: ImportSetValueStrategy): void {
      if (!props.strategy) {
        innerStrategy.value = next
      }
      emit('update:strategy', next)
    }

    /**
     * destroy Editor：负责该函数职责对应的主流程编排。
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

    /**
     * mountEditor：执行当前位置的功能逻辑。
     * 定位：`packages/ui-element-plus/src/components/ImportJsonAction.ts:146`。
     * 功能：处理参数消化、状态变更与调用链行为同步。
     * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
     */
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

    /**
     * parseFile：执行当前位置的功能逻辑。
     * 定位：`packages/ui-element-plus/src/components/ImportJsonAction.ts:163`。
     * 功能：处理参数消化、状态变更与调用链行为同步。
     * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
     * @param file 参数 file 为当前功能所需的输入信息。
     */
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

    /**
     * confirmImport：执行当前位置的功能逻辑。
     * 定位：`packages/ui-element-plus/src/components/ImportJsonAction.ts:185`。
     * 功能：处理参数消化、状态变更与调用链行为同步。
     * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
     */
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

    /**
     * render Strategy：负责“渲染render Strategy”的核心实现与调用衔接。
     * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
     * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
     *
     * 说明：该注释描述 render Strategy 的主要职责边界，便于维护者快速理解函数在链路中的定位。
     */
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
          /**
           * onChange：执行当前位置的功能逻辑。
           * 定位：`packages/ui-element-plus/src/components/ImportJsonAction.ts:258`。
           * 功能：处理参数消化、状态变更与调用链行为同步。
           * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
           * @param event 参数 event 为事件对象，用于提供交互上下文。
           */
          onChange: (event: Event) => {
            const value = (event.target as HTMLSelectElement).value as ImportSetValueStrategy
            setStrategy(value)
          },
        }, STRATEGY_OPTIONS.map(option => h('option', { key: option, value: option }, option))),
      ])
    }

    /**
     * render Source Modal：负责“渲染render Source Modal”的核心实现与调用衔接。
     * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
     * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
     *
     * 说明：该注释描述 render Source Modal 的主要职责边界，便于维护者快速理解函数在链路中的定位。
     */
    function renderSourceModal(): VNode {
      return h(ElDialog, {
        'title': props.sourceTitle,
        'modelValue': sourceOpen.value,
        'width': 560,
        'destroyOnClose': true,
        /**
         * onUpdate:modelValue：执行当前位置的功能逻辑。
         * 定位：`packages/ui-element-plus/src/components/ImportJsonAction.ts:279`。
         * 功能：处理参数消化、状态变更与调用链行为同步。
         * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
         * @param value 参数 value 为输入值，用于驱动后续逻辑。
         */
        'onUpdate:modelValue': (value: boolean) => {
          sourceOpen.value = value
        },
      }, {
        /**
         * default：执行当前位置的功能逻辑。
         * 定位：`packages/ui-element-plus/src/components/ImportJsonAction.ts:283`。
         * 功能：处理参数消化、状态变更与调用链行为同步。
         * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
         * @returns 返回当前分支执行后的处理结果。
         */
        default: () => [
          h('p', { style: { color: '#64748b', fontSize: '12px', margin: '0 0 12px' } }, props.sourceDescription),
          h(ElUpload, {
            showFileList: false,
            autoUpload: false,
            accept: '.json,application/json',
            /**
             * beforeUpload：执行当前位置的功能逻辑。
             * 定位：`packages/ui-element-plus/src/components/ImportJsonAction.ts:289`。
             * 功能：处理参数消化、状态变更与调用链行为同步。
             * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
             * @returns 返回当前分支执行后的处理结果。
             */
            beforeUpload: () => false,
            /**
             * onChange：执行当前位置的功能逻辑。
             * 定位：`packages/ui-element-plus/src/components/ImportJsonAction.ts:290`。
             * 功能：处理参数消化、状态变更与调用链行为同步。
             * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
             * @param file 参数 file 为当前功能所需的输入信息。
             * @param file.raw 上传文件对象的原始 File 实例。
             * @returns 返回当前分支执行后的处理结果。
             */
            onChange: (file: { raw?: File }) => {
              const nextFile = file.raw
              if (!nextFile) {
                return
              }
              void parseFile(nextFile)
              return false
            },
          }, {
            /**
             * default：执行当前位置的功能逻辑。
             * 定位：`packages/ui-element-plus/src/components/ImportJsonAction.ts:299`。
             * 功能：处理参数消化、状态变更与调用链行为同步。
             * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
             * @returns 返回当前分支执行后的处理结果。
             */
            default: () => h(ElButton, {}, () => '选择 JSON 文件'),
          }),
        ],
      })
    }

    /**
     * render Preview Modal：负责“渲染render Preview Modal”的核心实现与调用衔接。
     * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
     * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
     *
     * 说明：该注释描述 render Preview Modal 的主要职责边界，便于维护者快速理解函数在链路中的定位。
     */
    function renderPreviewModal(): VNode {
      /**
       * editorHostRef?????????????????
       * ???`packages/ui-element-plus/src/components/ImportJsonAction.ts:390`?
       * ?????????????????????????????????
       * ??????????????????????????
       * @param el ?? el ????????????
       */
      const /**
             * editorHostRef：执行当前位置的功能逻辑。
             * 定位：`packages/ui-element-plus/src/components/ImportJsonAction.ts:313`。
             * 功能：处理参数消化、状态变更与调用链行为同步。
             * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
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

      return h(ElDialog, {
        'title': props.previewTitle,
        'modelValue': previewOpen.value,
        'width': 960,
        'destroyOnClose': true,
        /**
         * onUpdate:modelValue：执行当前位置的功能逻辑。
         * 定位：`packages/ui-element-plus/src/components/ImportJsonAction.ts:331`。
         * 功能：处理参数消化、状态变更与调用链行为同步。
         * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
         * @param value 参数 value 为输入值，用于驱动后续逻辑。
         */
        'onUpdate:modelValue': (value: boolean) => {
          previewOpen.value = value
        },
      }, {
        /**
         * default：执行当前位置的功能逻辑。
         * 定位：`packages/ui-element-plus/src/components/ImportJsonAction.ts:335`。
         * 功能：处理参数消化、状态变更与调用链行为同步。
         * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
         * @returns 返回当前分支执行后的处理结果。
         */
        default: () => [
          h(ElAlert, {
            type: 'info',
            showIcon: true,
            title: props.previewDescription,
            closable: false,
            style: { marginBottom: '12px' },
          }),
          editorView,
          errorView,
        ],
        /**
         * footer：执行当前位置的功能逻辑。
         * 定位：`packages/ui-element-plus/src/components/ImportJsonAction.ts:346`。
         * 功能：处理参数消化、状态变更与调用链行为同步。
         * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
         * @returns 返回当前分支执行后的处理结果。
         */
        footer: () => [
          h(ElButton, { /**
                         * onClick：执行当前位置的功能逻辑。
                         * 定位：`packages/ui-element-plus/src/components/ImportJsonAction.ts:347`。
                         * 功能：处理参数消化、状态变更与调用链行为同步。
                         * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
                         */
            /**
             * onClick：执行当前位置的功能逻辑。
             * 定位：`packages/ui-element-plus/src/components/ImportJsonAction.ts:451`。
             * 功能：处理参数消化、状态变更与调用链行为同步。
             * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
             */
            onClick: () => { previewOpen.value = false },
          }, () => props.cancelText),
          h(ElButton, { type: 'primary', /**
                                          * onClick：执行当前位置的功能逻辑。
                                          * 定位：`packages/ui-element-plus/src/components/ImportJsonAction.ts:348`。
                                          * 功能：处理参数消化、状态变更与调用链行为同步。
                                          * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
                                          */
            /**
             * onClick：执行当前位置的功能逻辑。
             * 定位：`packages/ui-element-plus/src/components/ImportJsonAction.ts:458`。
             * 功能：处理参数消化、状态变更与调用链行为同步。
             * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
             */
            onClick: () => { void confirmImport() } }, () => props.confirmText),
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
        h(ElButton, { /**
                       * onClick：执行当前位置的功能逻辑。
                       * 定位：`packages/ui-element-plus/src/components/ImportJsonAction.ts:362`。
                       * 功能：处理参数消化、状态变更与调用链行为同步。
                       * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
                       */
          /**
           * onClick：执行当前位置的功能逻辑。
           * 定位：`packages/ui-element-plus/src/components/ImportJsonAction.ts:478`。
           * 功能：处理参数消化、状态变更与调用链行为同步。
           * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
           */
          onClick: () => { sourceOpen.value = true },
        }, () => props.buttonText),
        props.showStrategy ? renderStrategy() : null,
      ]),
      renderSourceModal(),
      renderPreviewModal(),
    ])
  },
})
