/**
 * 场景 29：文件、图片上传
 *
 * 覆盖：
 * - antd Upload 组件集成
 * - 文件上传 + 图片上传
 * - 图片预览
 * - 三种模式切换
 *
 * 自定义 FileUpload / ImageUpload 组件注册后，在 fieldProps 中通过 component 引用。
 * 注：react-image-crop 可用于图片裁剪，此处使用 antd Upload 做核心集成演示
 */
import type { UploadFile } from 'antd'
import React, { useState } from 'react'
import { PlusOutlined, UploadOutlined } from '@ant-design/icons'
import { observer } from 'mobx-react-lite'
import { FormField, FormProvider, registerComponent, useCreateForm } from '@moluoxixi/react'
import { LayoutFormActions, StatusTabs, setupAntd } from '@moluoxixi/ui-antd'
import { Button, message, Typography, Upload } from 'antd'

const { Title, Paragraph } = Typography

setupAntd()

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

// ========== 表单组件 ==========

/**
 * 文件、图片上传表单
 *
 * 展示文件上传、图片上传、预览、三种模式切换
 */
export const FileUploadForm = observer((): React.ReactElement => {
  const form = useCreateForm({
    initialValues: { title: '', files: [], images: [] },
  })

  return (
    <div>
      <Title level={3}>文件、图片上传</Title>
      <Paragraph type="secondary">antd Upload / 文件上传 / 图片上传 / 预览</Paragraph>
      <StatusTabs>
        {({ mode, showResult, showErrors }) => {
          form.pattern = mode
          return (
            <FormProvider form={form}>
              <form onSubmit={async (e: React.FormEvent) => {
                e.preventDefault()
                const res = await form.submit()
                if (res.errors.length > 0) showErrors(res.errors)
                else showResult(res.values)
              }} noValidate>
                <FormField name="title" fieldProps={{ label: '标题', required: true, component: 'Input' }} />
                <FormField name="files" fieldProps={{ label: '附件上传', component: 'FileUpload' }} />
                <FormField name="images" fieldProps={{ label: '图片上传', component: 'ImageUpload' }} />
                {mode === 'editable' && <LayoutFormActions onReset={() => form.reset()} />}
              </form>
            </FormProvider>
          )
        }}
      </StatusTabs>
    </div>
  )
})
