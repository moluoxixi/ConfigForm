/**
 * 场景 33：JSON 编辑器
 *
 * 覆盖：
 * - JSON 编辑 + 格式化 + 验证
 * - 实时语法检查
 * - 三种模式切换
 *
 * 注：实际项目可接入 vanilla-jsoneditor
 */
import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { FormField, useCreateForm } from '@moluoxixi/react';
import { setupAntd } from '@moluoxixi/ui-antd';
import { Button, Typography, Form, Input, Space, Tag } from 'antd';
import type { FieldInstance } from '@moluoxixi/core';
import { PlaygroundForm } from '../../components/PlaygroundForm';

const { Title, Paragraph, Text } = Typography;

setupAntd();

const DEFAULT_JSON = JSON.stringify({ name: '张三', age: 28, roles: ['admin', 'editor'], settings: { theme: 'dark', language: 'zh-CN' } }, null, 2);

/** 校验 JSON 字符串 */
function validateJson(str: string): { valid: boolean; error?: string } {
  try { JSON.parse(str); return { valid: true }; }
  catch (e) { return { valid: false, error: (e as Error).message }; }
}

export const JsonEditorForm = observer((): React.ReactElement => {
  const [jsonError, setJsonError] = useState<string | null>(null);

  const form = useCreateForm({ initialValues: { configName: 'API 配置', jsonContent: DEFAULT_JSON } });

  useEffect(() => {
    form.createField({ name: 'configName', label: '配置名称', required: true });
    form.createField({ name: 'jsonContent', label: 'JSON 内容', required: true });
  }, []);

  const handleJsonChange = (field: FieldInstance, value: string): void => {
    field.setValue(value);
    const check = validateJson(value);
    setJsonError(check.valid ? null : check.error ?? null);
  };

  /** 格式化 JSON */
  const formatJson = (): void => {
    const field = form.getField('jsonContent');
    if (!field) return;
    try {
      const parsed = JSON.parse(field.value as string);
      field.setValue(JSON.stringify(parsed, null, 2));
      setJsonError(null);
    } catch {
      /* 格式化失败，保持原样 */
    }
  };

  /** 压缩 JSON */
  const minifyJson = (): void => {
    const field = form.getField('jsonContent');
    if (!field) return;
    try {
      const parsed = JSON.parse(field.value as string);
      field.setValue(JSON.stringify(parsed));
      setJsonError(null);
    } catch {
      /* 压缩失败 */
    }
  };

  return (
    <div>
      <Title level={3}>JSON 编辑器</Title>
      <Paragraph type="secondary">JSON 编辑 + 格式化 + 压缩 + 实时语法检查</Paragraph>
      <PlaygroundForm form={form}>
        {({ mode }) => (
          <>
            <FormField name="configName">
              {(field: FieldInstance) => (
                <Form.Item label={field.label} required={field.required}>
                  <Input value={(field.value as string) ?? ''} onChange={(e) => field.setValue(e.target.value)} disabled={mode === 'disabled'} readOnly={mode === 'readOnly'} />
                </Form.Item>
              )}
            </FormField>

            <FormField name="jsonContent">
              {(field: FieldInstance) => (
                <Form.Item
                  label={<Space>{field.label} {jsonError ? <Tag color="error">语法错误</Tag> : <Tag color="success">合法 JSON</Tag>}</Space>}
                  required={field.required}
                  validateStatus={jsonError ? 'error' : undefined}
                  help={jsonError}
                >
                  {mode === 'editable' ? (
                    <>
                      <Space style={{ marginBottom: 8 }}>
                        <Button size="small" onClick={formatJson}>格式化</Button>
                        <Button size="small" onClick={minifyJson}>压缩</Button>
                      </Space>
                      <Input.TextArea
                        value={(field.value as string) ?? ''}
                        onChange={(e) => handleJsonChange(field, e.target.value)}
                        rows={14}
                        style={{ fontFamily: 'Consolas, Monaco, monospace', fontSize: 13 }}
                      />
                    </>
                  ) : (
                    <pre style={{ padding: 16, borderRadius: 8, background: '#f6f8fa', fontSize: 13, fontFamily: 'Consolas, Monaco, monospace', overflow: 'auto', maxHeight: 400, opacity: mode === 'disabled' ? 0.6 : 1 }}>
                      {(field.value as string) || '{}'}
                    </pre>
                  )}
                </Form.Item>
              )}
            </FormField>
          </>
        )}
      </PlaygroundForm>
    </div>
  );
});
