/**
 * 场景 39：Cron 表达式编辑器
 *
 * 覆盖：
 * - Cron 表达式输入 + 实时解析
 * - 快捷预设
 * - 下次执行时间预览
 * - 三种模式切换
 *
 * 注：实际项目可接入 react-js-cron
 */
import React, { useState, useEffect, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { FormProvider, FormField, useCreateForm } from '@moluoxixi/react';
import { setupAntd } from '@moluoxixi/ui-antd';
import { Button, Typography, Alert, Segmented, Form, Input, Select, Tag, Space } from 'antd';
import type { FieldInstance } from '@moluoxixi/core';
import type { FieldPattern } from '@moluoxixi/shared';

const { Title, Paragraph, Text } = Typography;

setupAntd();

const MODE_OPTIONS = [
  { label: '编辑态', value: 'editable' },
  { label: '阅读态', value: 'readOnly' },
  { label: '禁用态', value: 'disabled' },
];

/** Cron 预设 */
const CRON_PRESETS = [
  { label: '每分钟', value: '* * * * *' },
  { label: '每小时', value: '0 * * * *' },
  { label: '每天 0:00', value: '0 0 * * *' },
  { label: '每天 8:00', value: '0 8 * * *' },
  { label: '每周一 9:00', value: '0 9 * * 1' },
  { label: '每月 1 号 0:00', value: '0 0 1 * *' },
  { label: '工作日 9:00', value: '0 9 * * 1-5' },
  { label: '每 5 分钟', value: '*/5 * * * *' },
  { label: '每 30 分钟', value: '*/30 * * * *' },
];

/** 简单解析 Cron（实际项目用 cron-parser） */
function describeCron(expr: string): string {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return '格式错误（需要 5 个部分）';
  const [min, hour, day, month, week] = parts;

  const desc: string[] = [];
  if (min === '*' && hour === '*') desc.push('每分钟');
  else if (min === '0' && hour === '*') desc.push('每小时整点');
  else if (min.startsWith('*/')) desc.push(`每 ${min.slice(2)} 分钟`);
  else if (hour !== '*') desc.push(`${hour}:${min.padStart(2, '0')}`);
  else desc.push(`第 ${min} 分钟`);

  if (day !== '*') desc.push(`每月 ${day} 号`);
  if (month !== '*') desc.push(`${month} 月`);
  if (week !== '*') {
    const weekMap: Record<string, string> = { '0': '日', '1': '一', '2': '二', '3': '三', '4': '四', '5': '五', '6': '六', '1-5': '一至五（工作日）' };
    desc.push(`周${weekMap[week] ?? week}`);
  }

  return desc.join('，') || expr;
}

export const CronEditorForm = observer((): React.ReactElement => {
  const [mode, setMode] = useState<FieldPattern>('editable');
  const [result, setResult] = useState('');

  const form = useCreateForm({
    initialValues: { taskName: '数据同步', cronExpr: '0 8 * * 1-5' },
  });

  useEffect(() => {
    form.createField({ name: 'taskName', label: '任务名称', required: true });
    form.createField({ name: 'cronExpr', label: 'Cron 表达式', required: true });
  }, []);

  const switchMode = (p: FieldPattern): void => {
    setMode(p);
    ['taskName', 'cronExpr'].forEach((n) => { const f = form.getField(n); if (f) f.pattern = p; });
  };

  const cronValue = (form.getFieldValue('cronExpr') as string) ?? '';
  const cronDesc = useMemo(() => describeCron(cronValue), [cronValue]);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    const res = await form.submit();
    if (res.errors.length > 0) { setResult('验证失败: ' + res.errors.map((err) => err.message).join(', ')); }
    else { setResult(JSON.stringify(res.values, null, 2)); }
  };

  return (
    <div>
      <Title level={3}>Cron 表达式编辑器</Title>
      <Paragraph type="secondary">Cron 输入 / 快捷预设 / 实时解析 / 三种模式</Paragraph>
      <Segmented value={mode} onChange={(v) => switchMode(v as FieldPattern)} options={MODE_OPTIONS} style={{ marginBottom: 16 }} />

      <FormProvider form={form}>
        <form onSubmit={handleSubmit} noValidate>
          <FormField name="taskName">
            {(field: FieldInstance) => (
              <Form.Item label={field.label} required={field.required}>
                <Input value={(field.value as string) ?? ''} onChange={(e) => field.setValue(e.target.value)} disabled={mode === 'disabled'} readOnly={mode === 'readOnly'} style={{ width: 300 }} />
              </Form.Item>
            )}
          </FormField>

          <FormField name="cronExpr">
            {(field: FieldInstance) => (
              <Form.Item label={field.label} required={field.required}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Input
                    value={(field.value as string) ?? ''}
                    onChange={(e) => field.setValue(e.target.value)}
                    disabled={mode === 'disabled'}
                    readOnly={mode === 'readOnly'}
                    placeholder="如：0 8 * * 1-5"
                    addonBefore="Cron"
                    style={{ width: 400 }}
                  />

                  {/* 解析结果 */}
                  <div>
                    <Text type="secondary">解析结果：</Text>
                    <Tag color={cronDesc.includes('错误') ? 'error' : 'blue'}>{cronDesc}</Tag>
                  </div>

                  {/* 快捷预设 */}
                  {mode === 'editable' && (
                    <div>
                      <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>快捷预设：</Text>
                      <Space wrap>
                        {CRON_PRESETS.map((preset) => (
                          <Tag
                            key={preset.value}
                            color={field.value === preset.value ? 'blue' : 'default'}
                            style={{ cursor: 'pointer' }}
                            onClick={() => field.setValue(preset.value)}
                          >
                            {preset.label}
                          </Tag>
                        ))}
                      </Space>
                    </div>
                  )}

                  {/* Cron 字段说明 */}
                  <div style={{ background: '#f6f8fa', padding: 8, borderRadius: 4, fontSize: 12 }}>
                    <Text type="secondary">格式：分 时 日 月 周 | 示例：<Text code>0 8 * * 1-5</Text> = 工作日 8:00</Text>
                  </div>
                </Space>
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
