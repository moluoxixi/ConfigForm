import type { FormImportJSONOptions, ImportSetValueStrategy } from '@moluoxixi/plugin-import'
import type { CSSProperties, ReactElement } from 'react'
import { useForm } from '@moluoxixi/react'
import { Button, message, Modal, Upload } from 'antd'
import { useMemo, useState } from 'react'
import { JsonEditorModal } from './JsonEditorModal'

const DEFAULT_STRATEGY: ImportSetValueStrategy = 'merge'
const STRATEGY_OPTIONS: ImportSetValueStrategy[] = ['merge', 'shallow', 'replace']

/**
 * ImportJsonActionProps??????
 * ???`packages/ui-antd/src/components/ImportJsonAction.tsx:11`?
 * ??????????????????????????????
 */
export interface ImportJsonActionProps {
  buttonText?: string
  sourceTitle?: string
  sourceDescription?: string
  previewTitle?: string
  previewDescription?: string
  confirmText?: string
  showStrategy?: boolean
  strategy?: ImportSetValueStrategy
  defaultStrategy?: ImportSetValueStrategy
  importOptions?: Omit<FormImportJSONOptions, 'strategy'>
  className?: string
  style?: CSSProperties
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

/**
 * Import Json Action：负责编排该能力的主流程。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 Import Json Action 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
export function ImportJsonAction({
  buttonText = '导入 JSON',
  sourceTitle = '选择导入 JSON 文件',
  sourceDescription = '请选择一个 `.json` 文件，解析后会进入可编辑预览弹窗。',
  previewTitle = '导入 JSON 预览（可编辑）',
  previewDescription = '可在弹窗内直接编辑 JSON，确认后会按当前导入策略写入表单。',
  confirmText = '应用导入',
  showStrategy = true,
  strategy,
  defaultStrategy = DEFAULT_STRATEGY,
  importOptions,
  className,
  style,
}: ImportJsonActionProps): ReactElement {
  const form = useForm()
  const [sourceOpen, setSourceOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewData, setPreviewData] = useState<Record<string, unknown> | null>(null)
  const [internalStrategy, setInternalStrategy] = useState<ImportSetValueStrategy>(defaultStrategy)
  const activeStrategy = strategy ?? internalStrategy
  const parseOptions = useMemo(() => ({
    ...importOptions,
    strategy: activeStrategy,
  }), [activeStrategy, importOptions])

  /**
   * handleParseFile?????????????????
   * ???`packages/ui-antd/src/components/ImportJsonAction.tsx:83`?
   * ?????????????????????????????????
   * ??????????????????????????
   * @param file ?? file ????????????
   */
  const /**
         * handleParseFile：处理当前分支的交互与状态同步。
         * 功能：处理参数消化、状态变更与调用链行为同步。
         * @param file 参数 file 为当前功能所需的输入信息。
         */
    handleParseFile = async (file: File): Promise<void> => {
      try {
        const parseImportJSONFile = form.parseImportJSONFile
        if (!parseImportJSONFile) {
          throw new Error('importPlugin is not installed.')
        }
        const parsed = await parseImportJSONFile(file, parseOptions)
        setPreviewData(parsed.data)
        setPreviewOpen(true)
        setSourceOpen(false)
        message.info(`JSON 解析完成：可导入 ${parsed.appliedKeys.length} 个字段`)
      }
      catch (error) {
        const text = error instanceof Error ? error.message : String(error)
        message.error(`导入失败：${text}`)
      }
    }

  /**
   * handleApply?????????????????
   * ???`packages/ui-antd/src/components/ImportJsonAction.tsx:108`?
   * ?????????????????????????????????
   * ??????????????????????????
   * @param nextData ?? nextData ????????????
   */
  const /**
         * handleApply：处理当前分支的交互与状态同步。
         * 功能：处理参数消化、状态变更与调用链行为同步。
         * @param nextData 参数 nextData 为当前功能所需的输入信息。
         */
    handleApply = async (nextData: Record<string, unknown>): Promise<void> => {
      try {
        const applyImport = form.applyImport
        if (!applyImport) {
          throw new Error('importPlugin is not installed.')
        }
        const applied = applyImport(nextData, mergeApplyOptions(activeStrategy, importOptions))
        setPreviewData(nextData)
        setPreviewOpen(false)
        message.success(`JSON 导入成功：已更新 ${applied.appliedKeys.length} 个字段`)
      }
      catch (error) {
        const text = error instanceof Error ? error.message : String(error)
        message.error(`导入失败：${text}`)
      }
    }

  return (
    <div className={className} style={style}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <Button type="default" onClick={() => setSourceOpen(true)}>
          {buttonText}
        </Button>
        {showStrategy
          ? (
              <label style={{ fontSize: 12, color: '#475569', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                导入策略
                <select
                  value={activeStrategy}
                  onChange={event => setInternalStrategy(event.target.value as ImportSetValueStrategy)}
                  style={{ border: '1px solid #d0d7de', borderRadius: 6, padding: '4px 8px' }}
                >
                  {STRATEGY_OPTIONS.map(option => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            )
          : null}
      </div>

      <Modal
        title={sourceTitle}
        open={sourceOpen}
        footer={null}
        destroyOnHidden
        onCancel={() => setSourceOpen(false)}
      >
        <div style={{ marginBottom: 12, fontSize: 12, color: '#64748b' }}>
          {sourceDescription}
        </div>
        <Upload.Dragger
          accept=".json,application/json"
          showUploadList={false}
          multiple={false}
          beforeUpload={(file) => {
            void handleParseFile(file as File)
            return false
          }}
        >
          <p style={{ margin: 0, fontWeight: 600, color: '#334155' }}>点击或拖拽 JSON 文件到此处</p>
        </Upload.Dragger>
      </Modal>

      <JsonEditorModal
        open={previewOpen}
        title={previewTitle}
        value={previewData}
        description={previewDescription}
        confirmText={confirmText}
        onCancel={() => setPreviewOpen(false)}
        onChange={setPreviewData}
        onConfirm={handleApply}
      />
    </div>
  )
}
