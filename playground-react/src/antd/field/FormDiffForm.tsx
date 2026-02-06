/**
 * 场景 47：表单比对
 *
 * 覆盖：
 * - 变更高亮（修改过的字段标记）
 * - 原始值 vs 当前值比对
 * - 变更摘要
 * - 三种模式切换
 */
import React, { useState, useEffect, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { FormProvider, FormField, useCreateForm } from '@moluoxixi/react';
import { setupAntd } from '@moluoxixi/ui-antd';
import { Button, Typography, Alert, Segmented, Form, Input, InputNumber, Space, Tag, Card, Descriptions } from 'antd';
import type { FieldInstance } from '@moluoxixi/core';
import type { FieldPattern } from '@moluoxixi/shared';

const { Title, Paragraph, Text } = Typography;

setupAntd();

const MODE_OPTIONS = [
  { label: '编辑态', value: 'editable' },
  { label: '阅读态', value: 'readOnly' },
  { label: '禁用态', value: 'disabled' },
];

const FIELD_DEFS = [
  { name: 'name', label: '姓名', type: 'text' },
  { name: 'email', label: '邮箱', type: 'text' },
  { name: 'phone', label: '电话', type: 'text' },
  { name: 'salary', label: '薪资', type: 'number' },
  { name: 'department', label: '部门', type: 'text' },
  { name: 'bio', label: '简介', type: 'textarea' },
];

/** 原始值（模拟从数据库加载） */
const ORIGINAL_VALUES: Record<string, unknown> = {
  name: '张三',
  email: 'zhangsan@company.com',
  phone: '13800138000',
  salary: 25000,
  department: '技术部',
  bio: '5 年前端开发经验',
};

export const FormDiffForm = observer((): React.ReactElement => {
  const [mode, setMode] = useState<FieldPattern>('editable');
  const [result, setResult] = useState('');
  const [currentValues, setCurrentValues] = useState<Record<string, unknown>>({ ...ORIGINAL_VALUES });

  const form = useCreateForm({ initialValues: { ...ORIGINAL_VALUES } });

  useEffect(() => {
    FIELD_DEFS.forEach((d) => form.createField({ name: d.name, label: d.label }));
    const unsub = form.onValuesChange((values: Record<string, unknown>) => setCurrentValues({ ...values }));
    return unsub;
  }, []);

  const switchMode = (p: FieldPattern): void => {
    setMode(p);
    FIELD_DEFS.forEach((d) => { const f = form.getField(d.name); if (f) f.pattern = p; });
  };

  /** 变更字段列表 */
  const changedFields = useMemo(() => {
    return FIELD_DEFS.filter((d) => {
      const orig = ORIGINAL_VALUES[d.name];
      const curr = currentValues[d.name];
      return String(orig ?? '') !== String(curr ?? '');
    });
  }, [currentValues]);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    const res = await form.submit();
    if (res.errors.length > 0) { setResult('验证失败: ' + res.errors.map((err) => err.message).join(', ')); }
    else { setResult(JSON.stringify(res.values, null, 2)); }
  };

  return (
    <div>
      <Title level={3}>表单比对</Title>
      <Paragraph type="secondary">变更高亮 / 原始值 vs 当前值 / 变更摘要</Paragraph>
      <Segmented value={mode} onChange={(v) => switchMode(v as FieldPattern)} options={MODE_OPTIONS} style={{ marginBottom: 16 }} />

      {/* 变更摘要 */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Space>
          <Text strong>变更摘要：</Text>
          {changedFields.length === 0 ? (
            <Tag color="green">无变更</Tag>
          ) : (
            <>
              <Tag color="orange">{changedFields.length} 个字段已修改</Tag>
              {changedFields.map((d) => <Tag key={d.name} color="red">{d.label}</Tag>)}
            </>
          )}
        </Space>
      </Card>

      <FormProvider form={form}>
        <form onSubmit={handleSubmit} noValidate>
          {FIELD_DEFS.map((d) => {
            const isChanged = String(ORIGINAL_VALUES[d.name] ?? '') !== String(currentValues[d.name] ?? '');
            return (
              <FormField key={d.name} name={d.name}>
                {(field: FieldInstance) => (
                  <Form.Item
                    label={
                      <Space>
                        {d.label}
                        {isChanged && <Tag color="orange" style={{ fontSize: 10 }}>已修改</Tag>}
                      </Space>
                    }
                    style={{ background: isChanged ? '#fffbe6' : undefined, padding: isChanged ? '4px 8px' : undefined, borderRadius: 4 }}
                    help={isChanged ? <Text type="secondary" style={{ fontSize: 11 }}>原始值: {String(ORIGINAL_VALUES[d.name] ?? '—')}</Text> : undefined}
                  >
                    {d.type === 'number' ? (
                      <InputNumber value={field.value as number} onChange={(v) => field.setValue(v)} disabled={mode === 'disabled'} readOnly={mode === 'readOnly'} style={{ width: '100%' }} />
                    ) : d.type === 'textarea' ? (
                      <Input.TextArea value={(field.value as string) ?? ''} onChange={(e) => field.setValue(e.target.value)} disabled={mode === 'disabled'} readOnly={mode === 'readOnly'} rows={2} />
                    ) : (
                      <Input value={(field.value as string) ?? ''} onChange={(e) => field.setValue(e.target.value)} disabled={mode === 'disabled'} readOnly={mode === 'readOnly'} />
                    )}
                  </Form.Item>
                )}
              </FormField>
            );
          })}
          {mode === 'editable' && <Button type="primary" htmlType="submit">提交</Button>}
        </form>
      </FormProvider>

      {result && (<Alert style={{ marginTop: 16 }} type={result.startsWith('验证失败') ? 'error' : 'success'} message="提交结果" description={<pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{result}</pre>} />)}
    </div>
  );
});
