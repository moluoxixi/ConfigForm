import type { ReactElement } from 'react'
import { Upload as AUpload, Button } from 'antd'

export interface CfUploadProps {
  value?: unknown[]
  onChange?: (value: unknown[]) => void
  disabled?: boolean
  preview?: boolean
  accept?: string
  maxCount?: number
  multiple?: boolean
  listType?: 'text' | 'picture' | 'picture-card'
  action?: string
}

export function Upload({
  value,
  onChange,
  disabled,
  accept,
  maxCount,
  multiple,
  listType = 'text',
  action,
}: CfUploadProps): ReactElement {
  const fileList = Array.isArray(value)
    ? value.map((f, i) => ({
        uid: String(i),
        name: (f as { name?: string })?.name ?? `file-${i}`,
        status: 'done' as const,
        ...(f as object),
      }))
    : []

  return (
    <AUpload
      fileList={fileList}
      onChange={({ fileList: newList }) => {
        onChange?.(newList.map(f => ({
          uid: f.uid,
          name: f.name,
          status: f.status,
          url: f.url ?? (f.response as { url?: string })?.url,
        })))
      }}
      disabled={disabled}
      accept={accept}
      maxCount={maxCount}
      multiple={multiple}
      listType={listType}
      action={action}
    >
      {!disabled && (
        listType === 'picture-card'
          ? <div style={{ padding: 8 }}>+ 上传</div>
          : <Button>点击上传</Button>
      )}
    </AUpload>
  )
}
