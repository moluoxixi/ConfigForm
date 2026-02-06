/**
 * 场景 43：撤销重做
 *
 * 覆盖：
 * - undo / redo 操作
 * - 历史记录栈
 * - 键盘快捷键（Ctrl+Z / Ctrl+Shift+Z）
 * - 三种模式切换
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { FormProvider, FormField, useCreateForm } from '@moluoxixi/react';
import { setupAntd } from '@moluoxixi/ui-antd';
import {
  Button, Typography, Alert, Segmented, Form, Input, InputNumber, Space, Tag,
} from 'antd';
import { UndoOutlined, RedoOutlined } from '@ant-design/icons';
import type { FieldInstance } from '@moluoxixi/core';
import type { FieldPattern } from '@moluoxixi/shared';

const { Title, Paragraph, Text } = Typography;

setupAntd();

const MODE_OPTIONS = [
  { label: '编辑态', value: 'editable' },
  { label: '阅读态', value: 'readOnly' },
  { label: '禁用态', value: 'disabled' },
];

const FIELDS = ['title', 'category', 'amount', 'note'];

/** 历史记录最大长度 */
const MAX_HISTORY = 50;

export const UndoRedoForm = observer((): React.ReactElement => {
  const [mode, setMode] = useState<FieldPattern>('editable');
  const [result, setResult] = useState('');

  const form = useCreateForm({
    initialValues: { title: '', category: '', amount: 0, note: '' },
  });

  /** 历史记录栈 */
  const historyRef = useRef<Array<Record<string, unknown>>>([{ title: '', category: '', amount: 0, note: '' }]);
  const indexRef = useRef(0);
  const isRestoringRef = useRef(false);
  const [historyLen, setHistoryLen] = useState(1);
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    form.createField({ name: 'title', label: '标题', required: true });
    form.createField({ name: 'category', label: '分类' });
    form.createField({ name: 'amount', label: '金额' });
    form.createField({ name: 'note', label: '备注' });
  }, []);

  /** 记录历史 */
  const pushHistory = useCallback((values: Record<string, unknown>): void => {
    if (isRestoringRef.current) return;
    const history = historyRef.current;
    /* 截断 redo 部分 */
    historyRef.current = history.slice(0, indexRef.current + 1);
    historyRef.current.push({ ...values });
    if (historyRef.current.length > MAX_HISTORY) historyRef.current.shift();
    indexRef.current = historyRef.current.length - 1;
    setHistoryLen(historyRef.current.length);
    setCurrentIdx(indexRef.current);
  }, []);

  /** 监听值变化 */
  useEffect(() => {
    const unsub = form.onValuesChange((values: Record<string, unknown>) => {
      pushHistory(values);
    });
    return unsub;
  }, [form, pushHistory]);

  /** 撤销 */
  const undo = useCallback((): void => {
    if (indexRef.current <= 0) return;
    indexRef.current -= 1;
    isRestoringRef.current = true;
    form.setValues(historyRef.current[indexRef.current]);
    isRestoringRef.current = false;
    setCurrentIdx(indexRef.current);
  }, [form]);

  /** 重做 */
  const redo = useCallback((): void => {
    if (indexRef.current >= historyRef.current.length - 1) return;
    indexRef.current += 1;
    isRestoringRef.current = true;
    form.setValues(historyRef.current[indexRef.current]);
    isRestoringRef.current = false;
    setCurrentIdx(indexRef.current);
  }, [form]);

  /** 键盘快捷键 */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.ctrlKey && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
      if (e.ctrlKey && e.shiftKey && e.key === 'Z') { e.preventDefault(); redo(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  const switchMode = (p: FieldPattern): void => {
    setMode(p);
    FIELDS.forEach((n) => { const f = form.getField(n); if (f) f.pattern = p; });
  };

  const canUndo = currentIdx > 0;
  const canRedo = currentIdx < historyLen - 1;

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    const res = await form.submit();
    if (res.errors.length > 0) { setResult('验证失败: ' + res.errors.map((err) => err.message).join(', ')); }
    else { setResult(JSON.stringify(res.values, null, 2)); }
  };

  return (
    <div>
      <Title level={3}>撤销重做</Title>
      <Paragraph type="secondary">undo / redo 操作栈 / Ctrl+Z 撤销 / Ctrl+Shift+Z 重做</Paragraph>
      <Segmented value={mode} onChange={(v) => switchMode(v as FieldPattern)} options={MODE_OPTIONS} style={{ marginBottom: 16 }} />

      {/* 工具栏 */}
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<UndoOutlined />} disabled={!canUndo || mode !== 'editable'} onClick={undo}>
          撤销 (Ctrl+Z)
        </Button>
        <Button icon={<RedoOutlined />} disabled={!canRedo || mode !== 'editable'} onClick={redo}>
          重做 (Ctrl+Shift+Z)
        </Button>
        <Tag>历史记录：{currentIdx + 1} / {historyLen}</Tag>
      </Space>

      <FormProvider form={form}>
        <form onSubmit={handleSubmit} noValidate>
          {FIELDS.map((name) => (
            <FormField key={name} name={name}>
              {(field: FieldInstance) => (
                <Form.Item label={field.label} required={field.required}>
                  {name === 'amount' ? (
                    <InputNumber value={field.value as number} onChange={(v) => field.setValue(v)} disabled={mode === 'disabled'} readOnly={mode === 'readOnly'} style={{ width: '100%' }} />
                  ) : name === 'note' ? (
                    <Input.TextArea value={(field.value as string) ?? ''} onChange={(e) => field.setValue(e.target.value)} disabled={mode === 'disabled'} readOnly={mode === 'readOnly'} rows={3} />
                  ) : (
                    <Input value={(field.value as string) ?? ''} onChange={(e) => field.setValue(e.target.value)} disabled={mode === 'disabled'} readOnly={mode === 'readOnly'} />
                  )}
                </Form.Item>
              )}
            </FormField>
          ))}
          {mode === 'editable' && (<Space><Button type="primary" htmlType="submit">提交</Button><Button onClick={() => form.reset()}>重置</Button></Space>)}
        </form>
      </FormProvider>

      {result && (<Alert style={{ marginTop: 16 }} type={result.startsWith('验证失败') ? 'error' : 'success'} message="提交结果" description={<pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{result}</pre>} />)}
    </div>
  );
});
