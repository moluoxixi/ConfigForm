/**
 * 场景 37：Markdown 编辑器
 *
 * 覆盖：
 * - Markdown 编辑 + 实时预览
 * - 三种模式切换
 *
 * 注：实际项目可接入 @bytemd/react
 */
import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { FormProvider, FormField, useCreateForm } from '@moluoxixi/react';
import { setupAntd, StatusTabs } from '@moluoxixi/ui-antd';
import { Typography, Form, Input, Row, Col } from 'antd';
import type { FieldInstance } from '@moluoxixi/core';

const { Title, Paragraph, Text } = Typography;

setupAntd();

const DEFAULT_MD = `# 标题

## 二级标题

这是一段 **加粗** 文字，支持 *斜体* 和 \`行内代码\`。

- 列表项 1
- 列表项 2
- 列表项 3

> 引用文字

\`\`\`javascript
function hello() {
  console.log("Hello World!");
}
\`\`\``;

/** 简单 Markdown → HTML 转换（实际项目用 marked 等库） */
function simpleMarkdownToHtml(md: string): string {
  return md
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code style="background:#f0f0f0;padding:2px 4px;border-radius:3px">$1</code>')
    .replace(/^> (.*$)/gm, '<blockquote style="border-left:3px solid #ddd;padding-left:12px;color:#666">$1</blockquote>')
    .replace(/^- (.*$)/gm, '<li>$1</li>')
    .replace(/\n/g, '<br/>');
}

export const MarkdownEditorForm = observer((): React.ReactElement => {
  const form = useCreateForm({ initialValues: { docTitle: '使用指南', content: DEFAULT_MD } });

  useEffect(() => {
    form.createField({ name: 'docTitle', label: '文档标题', required: true });
    form.createField({ name: 'content', label: 'Markdown 内容', required: true });
  }, []);

  return (
    <div>
      <Title level={3}>Markdown 编辑器</Title>
      <Paragraph type="secondary">Markdown 编写 + 实时预览 / 三种模式（可接入 @bytemd/react）</Paragraph>
      <StatusTabs>
        {({ mode, showResult, showErrors }) => {
          form.pattern = mode;
          return (
          <FormProvider form={form}>
            <FormField name="docTitle">
              {(field: FieldInstance) => (
                <Form.Item label={field.label} required={field.required}>
                  <Input value={(field.value as string) ?? ''} onChange={(e) => field.setValue(e.target.value)} disabled={mode === 'disabled'} readOnly={mode === 'readOnly'} />
                </Form.Item>
              )}
            </FormField>

            <FormField name="content">
              {(field: FieldInstance) => (
                <Form.Item label={field.label} required={field.required}>
                  {mode === 'editable' ? (
                    <Row gutter={16}>
                      <Col span={12}>
                        <Text type="secondary" style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>编辑区</Text>
                        <Input.TextArea
                          value={(field.value as string) ?? ''}
                          onChange={(e) => field.setValue(e.target.value)}
                          rows={16}
                          style={{ fontFamily: 'Consolas, Monaco, monospace', fontSize: 13 }}
                        />
                      </Col>
                      <Col span={12}>
                        <Text type="secondary" style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>预览区</Text>
                        <div
                          style={{ border: '1px solid #d9d9d9', borderRadius: 6, padding: 12, minHeight: 380, overflow: 'auto', background: '#fafafa' }}
                          dangerouslySetInnerHTML={{ __html: simpleMarkdownToHtml((field.value as string) ?? '') }}
                        />
                      </Col>
                    </Row>
                  ) : (
                    <div
                      style={{ border: '1px solid #d9d9d9', borderRadius: 6, padding: 16, background: '#fafafa', opacity: mode === 'disabled' ? 0.6 : 1 }}
                      dangerouslySetInnerHTML={{ __html: simpleMarkdownToHtml((field.value as string) ?? '') }}
                    />
                  )}
                </Form.Item>
              )}
            </FormField>
          </FormProvider>
          );
        }}
      </StatusTabs>
    </div>
  );
});
