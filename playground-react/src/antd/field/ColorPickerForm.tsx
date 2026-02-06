/**
 * 场景 31：颜色选择器
 *
 * 覆盖：
 * - react-colorful 颜色选择器集成
 * - 颜色值同步
 * - 颜色预览
 * - 三种模式切换
 *
 * 注：如未安装 react-colorful，降级为 Input 输入 HEX 值
 */
import React, { useState, useEffect, lazy, Suspense } from 'react';
import { observer } from 'mobx-react-lite';
import { FormProvider, FormField, useCreateForm } from '@moluoxixi/react';
import { setupAntd } from '@moluoxixi/ui-antd';
import { Button, Typography, Alert, Segmented, Form, Input, Space, Spin } from 'antd';
import type { FieldInstance } from '@moluoxixi/core';
import type { FieldPattern } from '@moluoxixi/shared';

const { Title, Paragraph, Text } = Typography;

setupAntd();

const MODE_OPTIONS = [
  { label: '编辑态', value: 'editable' },
  { label: '阅读态', value: 'readOnly' },
  { label: '禁用态', value: 'disabled' },
];

/** 预设颜色 */
const PRESET_COLORS = ['#1677ff', '#52c41a', '#faad14', '#ff4d4f', '#722ed1', '#13c2c2', '#eb2f96', '#000000'];

/** 颜色预览块 */
function ColorSwatch({ color, size = 24 }: { color: string; size?: number }): React.ReactElement {
  return (
    <div
      style={{
        width: size,
        height: size,
        background: color || '#fff',
        border: '1px solid #d9d9d9',
        borderRadius: 4,
        display: 'inline-block',
        verticalAlign: 'middle',
      }}
    />
  );
}

/** 颜色选择器封装 */
const ColorEditor = observer(({
  field,
  pattern,
}: {
  field: FieldInstance;
  pattern: FieldPattern;
}): React.ReactElement => {
  const value = (field.value as string) ?? '#1677ff';

  /* 只读 / 禁用 */
  if (pattern !== 'editable') {
    return (
      <Space>
        <ColorSwatch color={value} size={32} />
        <Text code>{value}</Text>
      </Space>
    );
  }

  return (
    <div>
      <Space style={{ marginBottom: 8 }}>
        <input
          type="color"
          value={value}
          onChange={(e) => field.setValue(e.target.value)}
          style={{ width: 48, height: 48, border: 'none', cursor: 'pointer', padding: 0 }}
        />
        <Input
          value={value}
          onChange={(e) => field.setValue(e.target.value)}
          style={{ width: 120 }}
          placeholder="#000000"
        />
        <ColorSwatch color={value} size={32} />
      </Space>
      <div style={{ display: 'flex', gap: 4 }}>
        {PRESET_COLORS.map((c) => (
          <div
            key={c}
            onClick={() => field.setValue(c)}
            style={{
              width: 24,
              height: 24,
              background: c,
              borderRadius: 4,
              cursor: 'pointer',
              border: value === c ? '2px solid #333' : '1px solid #d9d9d9',
            }}
          />
        ))}
      </div>
    </div>
  );
});

export const ColorPickerForm = observer((): React.ReactElement => {
  const [mode, setMode] = useState<FieldPattern>('editable');
  const [result, setResult] = useState('');

  const form = useCreateForm({
    initialValues: { themeName: '自定义主题', primaryColor: '#1677ff', bgColor: '#ffffff', textColor: '#333333' },
  });

  useEffect(() => {
    form.createField({ name: 'themeName', label: '主题名称', required: true });
    form.createField({ name: 'primaryColor', label: '主色调', required: true });
    form.createField({ name: 'bgColor', label: '背景色' });
    form.createField({ name: 'textColor', label: '文字颜色' });
  }, []);

  const switchMode = (p: FieldPattern): void => {
    setMode(p);
    ['themeName', 'primaryColor', 'bgColor', 'textColor'].forEach((n) => { const f = form.getField(n); if (f) f.pattern = p; });
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    const res = await form.submit();
    if (res.errors.length > 0) { setResult('验证失败: ' + res.errors.map((err) => err.message).join(', ')); }
    else { setResult(JSON.stringify(res.values, null, 2)); }
  };

  return (
    <div>
      <Title level={3}>颜色选择器</Title>
      <Paragraph type="secondary">原生 color input + 预设色板 / HEX 输入 / 三种模式</Paragraph>
      <Segmented value={mode} onChange={(v) => switchMode(v as FieldPattern)} options={MODE_OPTIONS} style={{ marginBottom: 16 }} />

      <FormProvider form={form}>
        <form onSubmit={handleSubmit} noValidate>
          <FormField name="themeName">
            {(field: FieldInstance) => (
              <Form.Item label={field.label} required={field.required}>
                <Input value={(field.value as string) ?? ''} onChange={(e) => field.setValue(e.target.value)} disabled={mode === 'disabled'} readOnly={mode === 'readOnly'} />
              </Form.Item>
            )}
          </FormField>
          {['primaryColor', 'bgColor', 'textColor'].map((name) => (
            <FormField key={name} name={name}>
              {(field: FieldInstance) => (
                <Form.Item label={field.label} required={field.required}>
                  <ColorEditor field={field} pattern={mode} />
                </Form.Item>
              )}
            </FormField>
          ))}

          {/* 预览 */}
          <div style={{
            padding: 16, borderRadius: 8, marginBottom: 16, border: '1px solid #eee',
            background: (form.getFieldValue('bgColor') as string) || '#fff',
            color: (form.getFieldValue('textColor') as string) || '#333',
          }}>
            <h4 style={{ color: (form.getFieldValue('primaryColor') as string) || '#1677ff' }}>主题预览</h4>
            <p>这是文字颜色预览，背景色为 {form.getFieldValue('bgColor') as string || '#ffffff'}。</p>
            <button style={{ background: (form.getFieldValue('primaryColor') as string) || '#1677ff', color: '#fff', border: 'none', padding: '6px 16px', borderRadius: 4 }}>
              主色调按钮
            </button>
          </div>

          {mode === 'editable' && <Button type="primary" htmlType="submit">提交</Button>}
        </form>
      </FormProvider>

      {result && (<Alert style={{ marginTop: 16 }} type={result.startsWith('验证失败') ? 'error' : 'success'} message="提交结果" description={<pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{result}</pre>} />)}
    </div>
  );
});
