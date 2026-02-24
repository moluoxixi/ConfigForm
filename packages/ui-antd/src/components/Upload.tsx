import type { ReactElement } from 'react'
import { Upload as AUpload, Button } from 'antd'

/**
 * Cf Upload Props：类型接口定义。
 * 所属模块：`packages/ui-antd/src/components/Upload.tsx`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
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
 * Upload：当前功能模块的核心执行单元。
 * 所属模块：`packages/ui-antd/src/components/Upload.tsx`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param param1 原始解构参数（{
  value,
  onChange,
  disabled,
  accept,
  maxCount,
  multiple,
  listType = 'text',
  action,
}）用于提供待处理的值并参与结果计算。
 * @param param1.value 当前文件列表值。
 * @param param1.onChange 文件列表变更回调。
 * @param param1.disabled 是否禁用上传。
 * @param param1.accept 可接受的文件类型。
 * @param param1.maxCount 最大上传数量。
 * @param param1.multiple 是否允许多选上传。
 * @param param1.listType 文件列表展示样式。
 * @param param1.action 上传接口地址。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
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
