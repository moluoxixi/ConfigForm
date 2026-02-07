import type { FieldInstance } from '@moluoxixi/core'
import type { UploadFile } from 'antd'
import { PlusOutlined, UploadOutlined } from '@ant-design/icons'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/react'
import { setupAntd, StatusTabs } from '@moluoxixi/ui-antd'
import { Button, Form, Input, message, Typography, Upload } from 'antd'
import { observer } from 'mobx-react-lite'
/**
 * 场景 29：文件、图片上传
 *
 * 覆盖：
 * - antd Upload 组件集成
 * - 文件上传 + 图片上传
 * - 图片预览
 * - 三种模式切换
 *
 * 注：react-image-crop 可用于图片裁剪，此处使用 antd Upload 做核心集成演示
 */
import React, { useEffect, useState } from 'react'

const { Title, Paragraph } = Typography

setupAntd()

export const FileUploadForm = observer((): React.ReactElement => {
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [imageList, setImageList] = useState<UploadFile[]>([])

  const form = useCreateForm({
    initialValues: { title: '', files: [], images: [] },
  })

  useEffect(() => {
    form.createField({ name: 'title', label: '标题', required: true })
    form.createField({ name: 'files', label: '附件' })
    form.createField({ name: 'images', label: '图片' })
  }, [])

  /** 模拟上传（实际项目中替换为真实接口） */
  const mockUpload = (file: File): string => {
    message.success(`${file.name} 上传成功（模拟）`)
    return URL.createObjectURL(file)
  }

  return (
    <div>
      <Title level={3}>文件、图片上传</Title>
      <Paragraph type="secondary">antd Upload / 文件上传 / 图片上传 / 预览</Paragraph>
      <StatusTabs>
        {({ mode }) => {
          form.pattern = mode
          const isDisabled = mode === 'disabled' || mode === 'readOnly'
          return (
            <FormProvider form={form}>
              <FormField name="title">
                {(field: FieldInstance) => (
                  <Form.Item label={field.label} required={field.required}>
                    <Input value={(field.value as string) ?? ''} onChange={e => field.setValue(e.target.value)} disabled={mode === 'disabled'} readOnly={mode === 'readOnly'} />
                  </Form.Item>
                )}
              </FormField>

              <Form.Item label="附件上传">
                <Upload
                  fileList={fileList}
                  onChange={({ fileList: fl }) => {
                    setFileList(fl)
                    form.setFieldValue('files', fl.map(f => f.name))
                  }}
                  beforeUpload={(file) => {
                    mockUpload(file)
                    return false
                  }}
                  disabled={isDisabled}
                >
                  {!isDisabled && <Button icon={<UploadOutlined />}>选择文件</Button>}
                </Upload>
              </Form.Item>

              <Form.Item label="图片上传">
                <Upload
                  listType="picture-card"
                  fileList={imageList}
                  onChange={({ fileList: fl }) => {
                    setImageList(fl)
                    form.setFieldValue('images', fl.map(f => f.name))
                  }}
                  beforeUpload={(file) => {
                    const url = mockUpload(file)
                    setImageList(prev => [...prev, { uid: String(Date.now()), name: file.name, status: 'done', url }])
                    return false
                  }}
                  disabled={isDisabled}
                >
                  {!isDisabled && imageList.length < 6 && (
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>上传</div>
                    </div>
                  )}
                </Upload>
              </Form.Item>
            </FormProvider>
          )
        }}
      </StatusTabs>
    </div>
  )
})
