import type { ISchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/core'
import { PlusOutlined, UploadOutlined } from '@ant-design/icons'
import { ConfigForm, registerComponent } from '@moluoxixi/react'
import { setupAntd, StatusTabs } from '@moluoxixi/ui-antd'
import { observer } from 'mobx-react-lite'
/**
 * 场景 29：文件、图片上传 — ConfigForm + Schema
 *
 * 覆盖：
 * - 自定义 FileUpload / ImageUpload 组件注册
 * - 文件上传 + 图片上传
 * - 三种模式切换
 */
import React, { useRef, useState } from 'react'

setupAntd()

/** 工具：将 StatusTabs 的 mode 注入 schema */
function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}

// ========== 自定义组件：文件上传 ==========

/** 已上传文件信息 */
interface UploadedFile {
  uid: string
  name: string
}

/** 文件上传 Props */
interface FileUploadProps {
  /** 已上传文件名列表 */
  value?: string[]
  /** 值变更回调 */
  onChange?: (v: string[]) => void
  /** 是否禁用 */
  disabled?: boolean
  /** 是否只读 */
  readOnly?: boolean
}

/**
 * 文件上传组件
 *
 * 原生 input[type=file] 实现，支持禁用/只读态
 */
const FileUpload = observer(({ onChange, disabled, readOnly }: FileUploadProps): React.ReactElement => {
  const [fileList, setFileList] = useState<UploadedFile[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const isDisabled = disabled || readOnly

  /** 处理文件选择 */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const files = e.target.files
    if (!files) return
    const newFiles: UploadedFile[] = Array.from(files).map(f => ({ uid: String(Date.now() + Math.random()), name: f.name }))
    const updated = [...fileList, ...newFiles]
    setFileList(updated)
    onChange?.(updated.map(f => f.name))
    if (inputRef.current) inputRef.current.value = ''
  }

  /** 删除文件 */
  const handleRemove = (uid: string): void => {
    const updated = fileList.filter(f => f.uid !== uid)
    setFileList(updated)
    onChange?.(updated.map(f => f.name))
  }

  return (
    <div>
      {fileList.map(f => (
        <div key={f.uid} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 13 }}>{f.name}</span>
          {!isDisabled && (
            <button onClick={() => handleRemove(f.uid)} style={{ border: 'none', background: 'none', color: '#ff4d4f', cursor: 'pointer', fontSize: 12 }}>删除</button>
          )}
        </div>
      ))}
      {!isDisabled && (
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 12px', border: '1px solid #d9d9d9', borderRadius: 4, cursor: 'pointer', fontSize: 14, background: '#fff' }}>
          <UploadOutlined />
          选择文件
          <input ref={inputRef} type="file" multiple style={{ display: 'none' }} onChange={handleFileChange} />
        </label>
      )}
    </div>
  )
})

registerComponent('FileUpload', FileUpload, { defaultWrapper: 'FormItem' })

// ========== 自定义组件：图片上传 ==========

/** 图片上传 Props */
interface ImageUploadProps {
  /** 已上传图片名列表 */
  value?: string[]
  /** 值变更回调 */
  onChange?: (v: string[]) => void
  /** 是否禁用 */
  disabled?: boolean
  /** 是否只读 */
  readOnly?: boolean
}

/** 已上传图片信息 */
interface UploadedImage {
  uid: string
  name: string
  url: string
}

/** 最大图片数量 */
const MAX_IMAGE_COUNT = 6

/**
 * 图片上传组件
 *
 * 原生 input[type=file] + 预览卡片实现，支持禁用/只读态
 */
const ImageUpload = observer(({ onChange, disabled, readOnly }: ImageUploadProps): React.ReactElement => {
  const [imageList, setImageList] = useState<UploadedImage[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const isDisabled = disabled || readOnly

  /** 处理图片选择 */
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const files = e.target.files
    if (!files) return
    const newImages: UploadedImage[] = Array.from(files).map(f => ({
      uid: String(Date.now() + Math.random()),
      name: f.name,
      url: URL.createObjectURL(f),
    }))
    const updated = [...imageList, ...newImages].slice(0, MAX_IMAGE_COUNT)
    setImageList(updated)
    onChange?.(updated.map(f => f.name))
    if (inputRef.current) inputRef.current.value = ''
  }

  /** 删除图片 */
  const handleRemove = (uid: string): void => {
    const updated = imageList.filter(f => f.uid !== uid)
    setImageList(updated)
    onChange?.(updated.map(f => f.name))
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {imageList.map(img => (
        <div key={img.uid} style={{ width: 104, height: 104, border: '1px solid #d9d9d9', borderRadius: 8, overflow: 'hidden', position: 'relative' }}>
          <img src={img.url} alt={img.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          {!isDisabled && (
            <button
              onClick={() => handleRemove(img.uid)}
              style={{ position: 'absolute', top: 2, right: 2, border: 'none', background: 'rgba(0,0,0,0.5)', color: '#fff', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', fontSize: 12, lineHeight: '20px', padding: 0 }}
            >
              ×
            </button>
          )}
        </div>
      ))}
      {!isDisabled && imageList.length < MAX_IMAGE_COUNT && (
        <label style={{ width: 104, height: 104, border: '1px dashed #d9d9d9', borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: '#fafafa' }}>
          <PlusOutlined />
          <div style={{ marginTop: 8, fontSize: 12 }}>上传</div>
          <input ref={inputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleImageChange} />
        </label>
      )}
    </div>
  )
})

registerComponent('ImageUpload', ImageUpload, { defaultWrapper: 'FormItem' })

// ========== Schema & 初始值 ==========

/** 默认初始值 */
const INITIAL_VALUES: Record<string, unknown> = {
  title: '',
  files: [],
  images: [],
}

/** 表单 Schema */
const schema: ISchema = {
  type: 'object',
  decoratorProps: {
    labelPosition: 'right',
    labelWidth: '120px',
    actions: { submit: '提交', reset: '重置' },
  },
  properties: {
    title: {
      type: 'string',
      title: '标题',
      required: true,
      component: 'Input',
    },
    files: {
      type: 'array',
      title: '附件上传',
      component: 'FileUpload',
    },
    images: {
      type: 'array',
      title: '图片上传',
      component: 'ImageUpload',
    },
  },
}

/**
 * 文件、图片上传表单 — ConfigForm + Schema
 *
 * 展示文件上传、图片上传、三种模式切换
 */
export const FileUploadForm = observer((): React.ReactElement => (
  <div>
    <h2>文件、图片上传</h2>
    <p style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 16, fontSize: 14 }}>原生 Upload / 文件上传 / 图片上传 — ConfigForm + Schema</p>
    <StatusTabs>
      {({ mode, showResult, showErrors }) => (
        <ConfigForm
          schema={withMode(schema, mode)}
          initialValues={INITIAL_VALUES}
          onSubmit={showResult}
          onSubmitFailed={errors => showErrors(errors)}
        />
      )}
    </StatusTabs>
  </div>
))
