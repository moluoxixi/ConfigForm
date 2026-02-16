import type { FormExportDownloadJSONOptions, FormExportPreviewOptions } from '@moluoxixi/plugin-export'
import type { ReactElement, CSSProperties } from 'react'
import { useForm } from '@moluoxixi/react'
import { Button, message } from 'antd'
import { useEffect, useState } from 'react'
import { JsonEditorModal } from './JsonEditorModal'

export interface ExportJsonActionProps {
  buttonText?: string
  modalTitle?: string
  description?: string
  confirmText?: string
  filename?: string
  previewOptions?: FormExportPreviewOptions
  downloadOptions?: Omit<FormExportDownloadJSONOptions, 'filename'>
  className?: string
  style?: CSSProperties
}

export function ExportJsonAction({
  buttonText = '导出预览',
  modalTitle = '导出 JSON 预览',
  description = '当前表单值的 JSON 预览。点击“下载 JSON”导出文件。',
  confirmText = '下载 JSON',
  filename = 'order-export.json',
  previewOptions,
  downloadOptions,
  className,
  style,
}: ExportJsonActionProps): ReactElement {
  const form = useForm()
  const [open, setOpen] = useState(false)
  const [previewData, setPreviewData] = useState<Record<string, unknown>>({})

  useEffect(() => {
    const subscribeExportPreview = form.subscribeExportPreview
    if (!subscribeExportPreview) {
      return undefined
    }
    return subscribeExportPreview((preview) => {
      setPreviewData(preview.data)
    }, previewOptions)
  }, [form, previewOptions])

  const handleDownload = async (): Promise<void> => {
    try {
      const downloadJSON = form.downloadJSON
      if (!downloadJSON) {
        throw new Error('exportPlugin is not installed.')
      }
      await downloadJSON({
        ...downloadOptions,
        filename,
      })
      message.success('JSON 导出成功')
      setOpen(false)
    }
    catch (error) {
      const text = error instanceof Error ? error.message : String(error)
      message.error(`导出失败：${text}`)
    }
  }

  return (
    <div className={className} style={style}>
      <Button type="primary" onClick={() => setOpen(true)}>
        {buttonText}
      </Button>
      <JsonEditorModal
        open={open}
        title={modalTitle}
        value={previewData}
        readOnly
        description={description}
        confirmText={confirmText}
        onCancel={() => setOpen(false)}
        onConfirm={handleDownload}
      />
    </div>
  )
}
