/**
 * 场景 28：富文本编辑器
 *
 * 覆盖：
 * - react-quill 富文本编辑器集成
 * - 表单值同步
 * - 三种模式切换（编辑 / 只读 / 禁用）
 * - 内容预览
 *
 * 依赖：react-quill（https://www.npmjs.com/package/react-quill）
 */
import React, { useState, useEffect, lazy, Suspense } from 'react';
import { observer } from 'mobx-react-lite';
import { FormProvider, FormField, useCreateForm } from '@moluoxixi/react';
import { setupAntd } from '@moluoxixi/ui-antd';
import { Button, Typography, Alert, Segmented, Form, Input, Spin } from 'antd';
import type { FieldInstance } from '@moluoxixi/core';
import type { FieldPattern } from '@moluoxixi/shared';

const { Title, Paragraph, Text } = Typography;

setupAntd();

const MODE_OPTIONS = [
  { label: '编辑态', value: 'editable' },
  { label: '阅读态', value: 'readOnly' },
  { label: '禁用态', value: 'disabled' },
];

/** 懒加载 ReactQuill（可能未安装） */
let ReactQuill: React.ComponentType<{
  value: string;
  onChange: (v: string) => void;
  readOnly?: boolean;
  theme?: string;
  style?: React.CSSProperties;
}> | null = null;

try {
  ReactQuill = lazy(() => import('react-quill'));
} catch {
  ReactQuill = null;
}

/** 富文本编辑器封装（未安装时降级为 Textarea） */
const RichEditor = observer(({
  field,
  pattern,
}: {
  field: FieldInstance;
  pattern: FieldPattern;
}): React.ReactElement => {
  const value = (field.value as string) ?? '';

  /* 阅读态：纯 HTML 展示 */
  if (pattern === 'readOnly' || pattern === 'preview') {
    return (
      <div
        style={{ padding: 12, border: '1px solid #d9d9d9', borderRadius: 6, minHeight: 100, background: '#fafafa' }}
        dangerouslySetInnerHTML={{ __html: value || '<span style="color:#999">暂无内容</span>' }}
      />
    );
  }

  /* 禁用态 */
  if (pattern === 'disabled') {
    return (
      <div
        style={{ padding: 12, border: '1px solid #d9d9d9', borderRadius: 6, minHeight: 100, background: '#f5f5f5', opacity: 0.7 }}
        dangerouslySetInnerHTML={{ __html: value || '<span style="color:#999">暂无内容</span>' }}
      />
    );
  }

  /* 编辑态：尝试加载 ReactQuill */
  if (ReactQuill) {
    return (
      <Suspense fallback={<Spin />}>
        <ReactQuill
          value={value}
          onChange={(v: string) => field.setValue(v)}
          theme="snow"
          style={{ minHeight: 200 }}
        />
      </Suspense>
    );
  }

  /* 未安装 react-quill，降级为 Textarea */
  return (
    <div>
      <Alert type="warning" showIcon message="react-quill 未安装，使用 Textarea 替代" style={{ marginBottom: 8 }} />
      <Input.TextArea
        value={value}
        onChange={(e) => field.setValue(e.target.value)}
        rows={8}
        placeholder="在此输入 HTML 内容"
      />
    </div>
  );
});

export const RichTextForm = observer((): React.ReactElement => {
  const [mode, setMode] = useState<FieldPattern>('editable');
  const [result, setResult] = useState('');

  const form = useCreateForm({
    initialValues: {
      title: '示例文章',
      content: '<h2>标题</h2><p>这是一段<strong>富文本</strong>内容，支持 <em>格式化</em> 操作。</p>',
    },
  });

  useEffect(() => {
    form.createField({ name: 'title', label: '标题', required: true });
    form.createField({ name: 'content', label: '正文内容', required: true });
  }, []);

  const switchMode = (p: FieldPattern): void => {
    setMode(p);
    ['title', 'content'].forEach((n) => { const f = form.getField(n); if (f) f.pattern = p; });
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    const res = await form.submit();
    if (res.errors.length > 0) { setResult('验证失败: ' + res.errors.map((err) => err.message).join(', ')); }
    else { setResult(JSON.stringify(res.values, null, 2)); }
  };

  return (
    <div>
      <Title level={3}>富文本编辑器</Title>
      <Paragraph type="secondary">react-quill 集成 / 三种模式 / 未安装时 Textarea 降级</Paragraph>
      <Segmented value={mode} onChange={(v) => switchMode(v as FieldPattern)} options={MODE_OPTIONS} style={{ marginBottom: 16 }} />

      <FormProvider form={form}>
        <form onSubmit={handleSubmit} noValidate>
          <FormField name="title">
            {(field: FieldInstance) => (
              <Form.Item label={field.label} required={field.required}>
                <Input value={(field.value as string) ?? ''} onChange={(e) => field.setValue(e.target.value)} disabled={mode === 'disabled'} readOnly={mode === 'readOnly'} placeholder="文章标题" />
              </Form.Item>
            )}
          </FormField>
          <FormField name="content">
            {(field: FieldInstance) => (
              <Form.Item label={field.label} required={field.required}>
                <RichEditor field={field} pattern={mode} />
              </Form.Item>
            )}
          </FormField>
          {mode === 'editable' && <Button type="primary" htmlType="submit">提交</Button>}
        </form>
      </FormProvider>

      {result && (<Alert style={{ marginTop: 16 }} type={result.startsWith('验证失败') ? 'error' : 'success'} message="提交结果" description={<pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{result}</pre>} />)}
    </div>
  );
});
