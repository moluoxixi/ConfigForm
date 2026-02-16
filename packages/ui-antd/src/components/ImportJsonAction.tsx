import type { FormImportJSONOptions, ImportSetValueStrategy } from '@moluoxixi/plugin-import-core'
import type { ReactElement, CSSProperties } from 'react'
import { useForm } from '@moluoxixi/react'
import { Button, message, Modal, Upload } from 'antd'
import { useMemo, useState } from 'react'
import { JsonEditorModal } from './JsonEditorModal'

const DEFAULT_STRATEGY: ImportSetValueStrategy = 'merge'
const STRATEGY_OPTIONS: ImportSetValueStrategy[] = ['merge', 'shallow', 'replace']

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

  const handleParseFile = async (file: File): Promise<void> => {
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

  const handleApply = async (nextData: Record<string, unknown>): Promise<void> => {
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
