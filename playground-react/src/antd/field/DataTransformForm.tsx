/**
 * 场景 40：数据转换
 *
 * 覆盖：
 * - 提交前转换（transform）
 * - 显示时格式化（format）
 * - 输入时解析（parse）
 * - submitPath 路径映射
 * - 三种模式切换
 */
import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { FormProvider, FormField, useCreateForm } from '@moluoxixi/react';
import { setupAntd } from '@moluoxixi/ui-antd';
import { Button, Typography, Alert, Segmented, Form, Input, InputNumber, Space, Tag } from 'antd';
import type { FieldInstance } from '@moluoxixi/core';
import type { FieldPattern } from '@moluoxixi/shared';

const { Title, Paragraph, Text } = Typography;

setupAntd();

const MODE_OPTIONS = [
  { label: '编辑态', value: 'editable' },
  { label: '阅读态', value: 'readOnly' },
  { label: '禁用态', value: 'disabled' },
];

export const DataTransformForm = observer((): React.ReactElement => {
  const [mode, setMode] = useState<FieldPattern>('editable');
  const [result, setResult] = useState('');
  const [rawValues, setRawValues] = useState('');

  const form = useCreateForm({
    initialValues: {
      priceCent: 9990,
      phoneRaw: '13800138000',
      fullName: '张三',
      tags: 'react,vue,typescript',
    },
  });

  useEffect(() => {
    form.createField({
      name: 'priceCent',
      label: '价格（分→元）',
      required: true,
      format: (v: unknown) => v ? (Number(v) / 100).toFixed(2) : '',
      parse: (v: unknown) => Math.round(Number(v) * 100),
      transform: (v: unknown) => Number(v),
    });
    form.createField({
      name: 'phoneRaw',
      label: '手机号（脱敏）',
      format: (v: unknown) => {
        const s = String(v ?? '');
        return s.length === 11 ? `${s.slice(0, 3)}****${s.slice(7)}` : s;
      },
      parse: (v: unknown) => String(v).replace(/\D/g, ''),
    });
    form.createField({ name: 'fullName', label: '姓名', required: true });
    form.createField({
      name: 'tags',
      label: '标签（逗号分隔）',
      description: '提交时转为数组',
      transform: (v: unknown) => String(v ?? '').split(',').map((s: string) => s.trim()).filter(Boolean),
    });
  }, []);

  const switchMode = (p: FieldPattern): void => {
    setMode(p);
    ['priceCent', 'phoneRaw', 'fullName', 'tags'].forEach((n) => { const f = form.getField(n); if (f) f.pattern = p; });
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setRawValues(JSON.stringify(form.values, null, 2));
    const res = await form.submit();
    if (res.errors.length > 0) { setResult('验证失败: ' + res.errors.map((err) => err.message).join(', ')); }
    else { setResult(JSON.stringify(res.values, null, 2)); }
  };

  return (
    <div>
      <Title level={3}>数据转换</Title>
      <Paragraph type="secondary">format（显示格式化） / parse（输入解析） / transform（提交转换）</Paragraph>
      <Segmented value={mode} onChange={(v) => switchMode(v as FieldPattern)} options={MODE_OPTIONS} style={{ marginBottom: 16 }} />

      <FormProvider form={form}>
        <form onSubmit={handleSubmit} noValidate>
          {['priceCent', 'phoneRaw', 'fullName', 'tags'].map((name) => (
            <FormField key={name} name={name}>
              {(field: FieldInstance) => (
                <Form.Item label={field.label} required={field.required} help={field.description}>
                  <Space>
                    <Input
                      value={String(field.value ?? '')}
                      onChange={(e) => field.setValue(e.target.value)}
                      disabled={mode === 'disabled'}
                      readOnly={mode === 'readOnly'}
                      style={{ width: 300 }}
                    />
                    <Tag color="blue">原始值: {JSON.stringify(field.value)}</Tag>
                  </Space>
                </Form.Item>
              )}
            </FormField>
          ))}

          {mode === 'editable' && (<Space style={{ marginTop: 8 }}><Button type="primary" htmlType="submit">提交（查看转换结果）</Button><Button onClick={() => form.reset()}>重置</Button></Space>)}
        </form>
      </FormProvider>

      {rawValues && (
        <Alert style={{ marginTop: 16 }} type="info" message="表单原始值" description={<pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{rawValues}</pre>} />
      )}
      {result && (
        <Alert style={{ marginTop: 8 }} type={result.startsWith('验证失败') ? 'error' : 'success'} message="提交转换后的值" description={<pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{result}</pre>} />
      )}
    </div>
  );
});
