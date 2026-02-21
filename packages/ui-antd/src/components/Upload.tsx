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

/**
 * Upload：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 Upload 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
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
