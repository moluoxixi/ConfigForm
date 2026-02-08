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
/* TODO: 注册为 FormField component */
import type { UploadFile } from 'antd'
import React, { useState } from 'react'
import { observer } from 'mobx-react-lite'
import { FormField, FormProvider, registerComponent, useCreateForm } from '@moluoxixi/react'
import { LayoutFormActions, StatusTabs, setupAntd } from '@moluoxixi/ui-antd'
import { Upload } from 'antd'

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
        alert(`${file.name} 上传成功（模拟）`)
        return false
      }}
      disabled={isDisabled}
    >
      {!isDisabled && <button type="button" style={{ padding: '4px 15px', background: '#fff', border: '1px solid #d9d9d9', borderRadius: 6, cursor: 'pointer' }}>📁 选择文件</button>}
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
        alert(`${file.name} 上传成功（模拟）`)
        setImageList(prev => [...prev, { uid: String(Date.now()), name: file.name, status: 'done', url }])
        return false
      }}
      disabled={isDisabled}
    >
      {!isDisabled && imageList.length < MAX_IMAGE_COUNT && (
        <div>
          <span style={{ fontSize: 20 }}>+</span>
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
      <h3>文件、图片上传</h3>
      <p style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 16, fontSize: 14 }}>antd Upload / 文件上传 / 图片上传 / 预览</p>
      <StatusTabs>
        {({ mode, showResult, showErrors }) => {
          form.pattern = mode
          return (
            <FormProvider form={form}>
                <FormField name="title" fieldProps={{ label: '标题', required: true, component: 'Input' }} />
                <FormField name="files" fieldProps={{ label: '附件上传', component: 'FileUpload' }} />
                <FormField name="images" fieldProps={{ label: '图片上传', component: 'ImageUpload' }} />
                <LayoutFormActions onSubmit={showResult} onSubmitFailed={showErrors} />
            </FormProvider>
          )
        }}
      </StatusTabs>
    </div>
  )
})
