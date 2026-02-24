import type { FormExportDownloadJSONOptions, FormExportPreviewOptions } from '@moluoxixi/plugin-export'
import type { CSSProperties, ReactElement } from 'react'
import { useForm } from '@moluoxixi/react'
import { Button, message } from 'antd'
import { useEffect, useState } from 'react'
import { JsonEditorModal } from './JsonEditorModal'

/**
 * Export Json Action Props：描述该模块对外暴露的数据结构。
 * 所属模块：`packages/ui-antd/src/components/ExportJsonAction.tsx`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
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

/**
 * Export Json Action：封装该模块的核心渲染与交互逻辑。
 * 所属模块：`packages/ui-antd/src/components/ExportJsonAction.tsx`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param param1 原始解构参数（{
  buttonText = '导出预览',
  modalTitle = '导出 JSON 预览',
  description = '当前表单值的 JSON 预览。点击“下载 JSON”导出文件。',
  confirmText = '下载 JSON',
  filename = 'order-export.json',
  previewOptions,
  downloadOptions,
  className,
  style,
}）用于提供可选配置，调整当前功能模块的执行策略。
 * @param param1.buttonText 触发按钮文案。
 * @param param1.modalTitle 弹窗标题文案。
 * @param param1.description 弹窗说明文案。
 * @param param1.confirmText 确认按钮文案。
 * @param param1.filename 下载文件名。
 * @param param1.previewOptions 预览数据生成参数。
 * @param param1.downloadOptions 下载行为配置。
 * @param param1.className 外层容器类名。
 * @param param1.style 外层容器样式。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
 */
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

  /**
   * handle Download：封装该模块的核心渲染与交互逻辑。
   * 所属模块：`packages/ui-antd/src/components/ExportJsonAction.tsx`。
   * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
   * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
   */
  const /**
         * handleDownload：执行当前功能逻辑。
         *
         * @returns 返回当前功能的处理结果。
         */
    handleDownload = async (): Promise<void> => {
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
