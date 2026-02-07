import type { ISchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/shared'
import type { UploadFile } from 'antd'
import { PlusOutlined, UploadOutlined } from '@ant-design/icons'
import { ConfigForm, registerComponent } from '@moluoxixi/react'
import { setupAntd, StatusTabs } from '@moluoxixi/ui-antd'
import { Button, message, Typography, Upload } from 'antd'
import { observer } from 'mobx-react-lite'
/**
 * 场景 29：文件、图片上传 — ConfigForm + Schema
 *
 * 覆盖：
 * - 自定义 FileUpload / ImageUpload 组件注册
 * - 文件上传 + 图片上传
 * - 三种模式切换
 */
import React, { useState } from 'react'

const { Title, Paragraph } = Typography

setupAntd()

/** 工具：将 StatusTabs 的 mode 注入 schema */
function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}

// ========== 自定义组件：文件上传 ==========

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
 * 封装 antd Upload，支持禁用/只读态
 */
const FileUpload = observer(({ onChange, disabled, readOnly }: FileUploadProps): React.ReactElement => {
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const isDisabled = disabled || readOnly

  return (
    <Upload
      fileList={fileList}
      onChange={({ fileList: fl }) => {
        setFileList(fl)
        onChange?.(fl.map(f => f.name))
      }}
      beforeUpload={(file) => {
        message.success(`${file.name} 上传成功（模拟）`)
        return false
      }}
      disabled={isDisabled}
    >
      {!isDisabled && <Button icon={<UploadOutlined />}>选择文件</Button>}
    </Upload>
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

/** 最大图片数量 */
const MAX_IMAGE_COUNT = 6

/**
 * 图片上传组件
 *
 * 封装 antd Upload（picture-card 模式），支持禁用/只读态
 */
const ImageUpload = observer(({ onChange, disabled, readOnly }: ImageUploadProps): React.ReactElement => {
  const [imageList, setImageList] = useState<UploadFile[]>([])
  const isDisabled = disabled || readOnly

  return (
    <Upload
      listType="picture-card"
      fileList={imageList}
      onChange={({ fileList: fl }) => {
        setImageList(fl)
        onChange?.(fl.map(f => f.name))
      }}
      beforeUpload={(file) => {
        const url = URL.createObjectURL(file)
        message.success(`${file.name} 上传成功（模拟）`)
        setImageList(prev => [...prev, { uid: String(Date.now()), name: file.name, status: 'done', url }])
        return false
      }}
      disabled={isDisabled}
    >
      {!isDisabled && imageList.length < MAX_IMAGE_COUNT && (
        <div>
          <PlusOutlined />
          <div style={{ marginTop: 8 }}>上传</div>
        </div>
      )}
    </Upload>
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
    <Title level={3}>文件、图片上传</Title>
    <Paragraph type="secondary">antd Upload / 文件上传 / 图片上传 — ConfigForm + Schema</Paragraph>
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
