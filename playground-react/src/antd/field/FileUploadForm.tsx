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
import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { FormProvider, FormField, useCreateForm } from '@moluoxixi/react';
import { setupAntd } from '@moluoxixi/ui-antd';
import { Button, Typography, Alert, Segmented, Form, Input, Upload, message } from 'antd';
import { UploadOutlined, PlusOutlined } from '@ant-design/icons';
import type { FieldInstance } from '@moluoxixi/core';
import type { FieldPattern } from '@moluoxixi/shared';
import type { UploadFile } from 'antd';

const { Title, Paragraph } = Typography;

setupAntd();

const MODE_OPTIONS = [
  { label: '编辑态', value: 'editable' },
  { label: '阅读态', value: 'readOnly' },
  { label: '禁用态', value: 'disabled' },
];

export const FileUploadForm = observer((): React.ReactElement => {
  const [mode, setMode] = useState<FieldPattern>('editable');
  const [result, setResult] = useState('');
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [imageList, setImageList] = useState<UploadFile[]>([]);

  const form = useCreateForm({
    initialValues: { title: '', files: [], images: [] },
  });

  useEffect(() => {
    form.createField({ name: 'title', label: '标题', required: true });
    form.createField({ name: 'files', label: '附件' });
    form.createField({ name: 'images', label: '图片' });
  }, []);

  const switchMode = (p: FieldPattern): void => {
    setMode(p);
    ['title', 'files', 'images'].forEach((n) => { const f = form.getField(n); if (f) f.pattern = p; });
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    const res = await form.submit();
    if (res.errors.length > 0) { setResult('验证失败: ' + res.errors.map((err) => err.message).join(', ')); }
    else {
      setResult(JSON.stringify({
        ...res.values,
        files: fileList.map((f) => ({ name: f.name, size: f.size })),
        images: imageList.map((f) => ({ name: f.name, size: f.size })),
      }, null, 2));
    }
  };

  /** 模拟上传（实际项目中替换为真实接口） */
  const mockUpload = (file: File): string => {
    message.success(`${file.name} 上传成功（模拟）`);
    return URL.createObjectURL(file);
  };

  const isDisabled = mode === 'disabled' || mode === 'readOnly';

  return (
    <div>
      <Title level={3}>文件、图片上传</Title>
      <Paragraph type="secondary">antd Upload / 文件上传 / 图片上传 / 预览</Paragraph>
      <Segmented value={mode} onChange={(v) => switchMode(v as FieldPattern)} options={MODE_OPTIONS} style={{ marginBottom: 16 }} />

      <FormProvider form={form}>
        <form onSubmit={handleSubmit} noValidate>
          <FormField name="title">
            {(field: FieldInstance) => (
              <Form.Item label={field.label} required={field.required}>
                <Input value={(field.value as string) ?? ''} onChange={(e) => field.setValue(e.target.value)} disabled={mode === 'disabled'} readOnly={mode === 'readOnly'} />
              </Form.Item>
            )}
          </FormField>

          <Form.Item label="附件上传">
            <Upload
              fileList={fileList}
              onChange={({ fileList: fl }) => { setFileList(fl); form.setFieldValue('files', fl.map((f) => f.name)); }}
              beforeUpload={(file) => { mockUpload(file); return false; }}
              disabled={isDisabled}
            >
              {!isDisabled && <Button icon={<UploadOutlined />}>选择文件</Button>}
            </Upload>
          </Form.Item>

          <Form.Item label="图片上传">
            <Upload
              listType="picture-card"
              fileList={imageList}
              onChange={({ fileList: fl }) => { setImageList(fl); form.setFieldValue('images', fl.map((f) => f.name)); }}
              beforeUpload={(file) => {
                const url = mockUpload(file);
                setImageList((prev) => [...prev, { uid: String(Date.now()), name: file.name, status: 'done', url }]);
                return false;
              }}
              disabled={isDisabled}
            >
              {!isDisabled && imageList.length < 6 && (
                <div><PlusOutlined /><div style={{ marginTop: 8 }}>上传</div></div>
              )}
            </Upload>
          </Form.Item>

          {mode === 'editable' && <Button type="primary" htmlType="submit">提交</Button>}
        </form>
      </FormProvider>

      {result && (<Alert style={{ marginTop: 16 }} type={result.startsWith('验证失败') ? 'error' : 'success'} message="提交结果" description={<pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{result}</pre>} />)}
    </div>
  );
});
