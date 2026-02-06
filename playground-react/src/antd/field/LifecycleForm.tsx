/**
 * 场景 44：生命周期钩子
 *
 * 覆盖：
 * - onMount：表单挂载
 * - onChange：值变化监听
 * - onSubmit：提交拦截
 * - onReset：重置拦截
 * - 自动保存（防抖）
 * - 事件日志面板
 * - 三种模式切换
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { FormProvider, FormField, useCreateForm } from '@moluoxixi/react';
import { setupAntd } from '@moluoxixi/ui-antd';
import {
  Button, Typography, Alert, Segmented, Form, Input, InputNumber, Space, Tag, Card, Badge, Switch,
} from 'antd';
import type { FieldInstance } from '@moluoxixi/core';
import type { FieldPattern } from '@moluoxixi/shared';

const { Title, Paragraph, Text } = Typography;

setupAntd();

const MODE_OPTIONS = [
  { label: '编辑态', value: 'editable' },
  { label: '阅读态', value: 'readOnly' },
  { label: '禁用态', value: 'disabled' },
];

const FIELDS = ['title', 'price', 'description'];

/** 自动保存防抖时间（ms） */
const AUTO_SAVE_DELAY = 1500;

interface LogEntry {
  id: number;
  time: string;
  type: 'mount' | 'change' | 'submit' | 'reset' | 'auto-save';
  message: string;
}

let logId = 0;

export const LifecycleForm = observer((): React.ReactElement => {
  const [mode, setMode] = useState<FieldPattern>('editable');
  const [result, setResult] = useState('');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [autoSave, setAutoSave] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const form = useCreateForm({
    initialValues: { title: '生命周期测试', price: 99, description: '' },
  });

  /** 添加日志 */
  const addLog = useCallback((type: LogEntry['type'], msg: string): void => {
    logId += 1;
    setLogs((prev) => [{ id: logId, time: new Date().toLocaleTimeString(), type, message: msg }, ...prev].slice(0, 50));
  }, []);

  useEffect(() => {
    form.createField({ name: 'title', label: '标题', required: true });
    form.createField({ name: 'price', label: '价格' });
    form.createField({ name: 'description', label: '描述' });

    /* onMount */
    addLog('mount', '表单已挂载');

    /* onChange：监听值变化 */
    const unsub = form.onValuesChange((values: Record<string, unknown>) => {
      addLog('change', `值变化：${JSON.stringify(values).slice(0, 80)}...`);

      /* 自动保存（防抖） */
      if (timerRef.current) clearTimeout(timerRef.current);
      if (autoSave) {
        timerRef.current = setTimeout(() => {
          addLog('auto-save', '自动保存到 localStorage');
          try { localStorage.setItem('lifecycle-form-auto', JSON.stringify(values)); } catch { /* ignore */ }
        }, AUTO_SAVE_DELAY);
      }
    });

    return () => {
      unsub();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [autoSave]);

  const switchMode = (p: FieldPattern): void => {
    setMode(p);
    FIELDS.forEach((n) => { const f = form.getField(n); if (f) f.pattern = p; });
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    addLog('submit', '提交开始');
    const res = await form.submit();
    if (res.errors.length > 0) {
      addLog('submit', '提交失败: ' + res.errors.map((err) => err.message).join(', '));
      setResult('验证失败: ' + res.errors.map((err) => err.message).join(', '));
    } else {
      addLog('submit', '提交成功');
      setResult(JSON.stringify(res.values, null, 2));
    }
  };

  const handleReset = (): void => {
    addLog('reset', '表单已重置');
    form.reset();
  };

  const typeColors: Record<string, string> = { mount: 'purple', change: 'blue', submit: 'green', reset: 'orange', 'auto-save': 'cyan' };

  return (
    <div>
      <Title level={3}>生命周期钩子</Title>
      <Paragraph type="secondary">onMount / onChange / onSubmit / onReset / 自动保存（{AUTO_SAVE_DELAY}ms 防抖）</Paragraph>
      <Segmented value={mode} onChange={(v) => switchMode(v as FieldPattern)} options={MODE_OPTIONS} style={{ marginBottom: 16 }} />

      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <Space style={{ marginBottom: 12 }}>
            <Text>自动保存：</Text>
            <Switch checked={autoSave} onChange={(v) => setAutoSave(v)} />
          </Space>

          <FormProvider form={form}>
            <form onSubmit={handleSubmit} noValidate>
              {FIELDS.map((name) => (
                <FormField key={name} name={name}>
                  {(field: FieldInstance) => (
                    <Form.Item label={field.label} required={field.required}>
                      {name === 'price' ? (
                        <InputNumber value={field.value as number} onChange={(v) => field.setValue(v)} disabled={mode === 'disabled'} readOnly={mode === 'readOnly'} style={{ width: '100%' }} />
                      ) : name === 'description' ? (
                        <Input.TextArea value={(field.value as string) ?? ''} onChange={(e) => field.setValue(e.target.value)} disabled={mode === 'disabled'} readOnly={mode === 'readOnly'} rows={3} />
                      ) : (
                        <Input value={(field.value as string) ?? ''} onChange={(e) => field.setValue(e.target.value)} disabled={mode === 'disabled'} readOnly={mode === 'readOnly'} />
                      )}
                    </Form.Item>
                  )}
                </FormField>
              ))}
              {mode === 'editable' && (
                <Space>
                  <Button type="primary" htmlType="submit">提交</Button>
                  <Button onClick={handleReset}>重置</Button>
                </Space>
              )}
            </form>
          </FormProvider>
        </div>

        {/* 事件日志面板 */}
        <Card title={<span>事件日志 <Badge count={logs.length} /></span>} size="small" style={{ width: 360 }}
          extra={<Button size="small" onClick={() => setLogs([])}>清空</Button>}
        >
          <div style={{ maxHeight: 400, overflow: 'auto', fontSize: 12 }}>
            {logs.map((log) => (
              <div key={log.id} style={{ padding: '2px 0', borderBottom: '1px solid #f0f0f0' }}>
                <Tag color={typeColors[log.type] ?? 'default'} style={{ fontSize: 10 }}>{log.type}</Tag>
                <Text type="secondary">{log.time}</Text>
                <div style={{ color: '#555', marginTop: 2 }}>{log.message}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {result && (<Alert style={{ marginTop: 16 }} type={result.startsWith('验证失败') ? 'error' : 'success'} message="提交结果" description={<pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{result}</pre>} />)}
    </div>
  );
});
