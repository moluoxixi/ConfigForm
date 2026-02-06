/**
 * 生命周期 - antd 版
 *
 * 覆盖场景：
 * - 值变化事件（全量 + 单字段）
 * - 提交成功/失败回调
 * - 重置表单
 * - 焦点事件
 * - 自动保存（localStorage + 防抖 1s）
 * - 脏检测（beforeunload）
 * - 事件日志面板（带分类筛选，使用 antd Tag / Badge）
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { FormProvider, FormField, useCreateForm } from '@moluoxixi/react';
import { setupAntd } from '@moluoxixi/ui-antd';
import {
  Button, Typography, Alert, Input, Select, Form, Space, Badge, Tag, Segmented,
} from 'antd';
import type { FieldInstance } from '@moluoxixi/core';

const { Title, Paragraph, Text } = Typography;

setupAntd();

/** 事件日志条目 */
interface EventLogEntry {
  id: number;
  time: string;
  type: 'value' | 'focus' | 'submit' | 'reset' | 'autosave';
  message: string;
}

type EventFilter = 'all' | EventLogEntry['type'];

/** localStorage 键 */
const STORAGE_KEY = 'antd-lifecycle-form-autosave';

/** 防抖延迟 */
const DEBOUNCE_DELAY = 1000;

/** 最大日志数 */
const MAX_LOG_COUNT = 100;

/** 当前时间字符串 */
function now(): string {
  return new Date().toLocaleTimeString('zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

/** 事件类型颜色 */
const EVENT_COLORS: Record<EventLogEntry['type'], string> = {
  value: 'blue',
  focus: 'purple',
  submit: 'green',
  reset: 'orange',
  autosave: 'cyan',
};

/** 事件类型中文名 */
const EVENT_LABELS: Record<EventLogEntry['type'], string> = {
  value: '值变化',
  focus: '焦点',
  submit: '提交',
  reset: '重置',
  autosave: '自动保存',
};

/** 尝试从 localStorage 恢复数据 */
function loadSavedValues(): Record<string, unknown> | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved) as Record<string, unknown>;
  } catch {
    /* 忽略解析失败 */
  }
  return null;
}

/** 默认值 */
const DEFAULT_VALUES = { title: '', content: '', category: 'tech', tags: '' };

/**
 * 生命周期示例
 */
export const LifecycleForm = observer(() => {
  const savedValues = loadSavedValues();
  const hasRestoredRef = useRef(!!savedValues);

  const form = useCreateForm({
    initialValues: savedValues ?? { ...DEFAULT_VALUES },
  });

  const [eventLog, setEventLog] = useState<EventLogEntry[]>([]);
  const [eventFilter, setEventFilter] = useState<EventFilter>('all');
  const [submitResult, setSubmitResult] = useState('');
  const logIdRef = useRef(0);
  const logEndRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** 追加日志 */
  const appendLog = useCallback((type: EventLogEntry['type'], message: string): void => {
    logIdRef.current += 1;
    const entry: EventLogEntry = { id: logIdRef.current, time: now(), type, message };
    setEventLog((prev) => {
      const next = [...prev, entry];
      return next.length > MAX_LOG_COUNT ? next.slice(-MAX_LOG_COUNT) : next;
    });
  }, []);

  /** 自动保存 */
  const autoSave = useCallback((values: Record<string, unknown>): void => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
        appendLog('autosave', '已自动保存到 localStorage');
      } catch (error) {
        appendLog('autosave', `自动保存失败: ${String(error)}`);
      }
    }, DEBOUNCE_DELAY);
  }, [appendLog]);

  /* 创建字段 + 注册事件 */
  useEffect(() => {
    form.createField({ name: 'title', label: '文章标题', required: true, rules: [{ minLength: 2, message: '标题至少 2 个字符' }] });
    form.createField({ name: 'content', label: '文章内容', required: true, rules: [{ minLength: 10, message: '内容至少 10 个字符' }] });
    form.createField({
      name: 'category',
      label: '分类',
      required: true,
      dataSource: [
        { label: '技术', value: 'tech' },
        { label: '设计', value: 'design' },
        { label: '产品', value: 'product' },
        { label: '运营', value: 'operation' },
      ],
    });
    form.createField({ name: 'tags', label: '标签', description: '多个标签用逗号分隔' });

    if (hasRestoredRef.current) appendLog('autosave', '已从 localStorage 恢复上次编辑的数据');

    const disposeValues = form.onValuesChange((values) => {
      appendLog('value', `表单值变化: ${JSON.stringify(values)}`);
      autoSave(values);
    });
    const disposeTitle = form.onFieldValueChange('title', (value) => appendLog('value', `标题 → "${String(value)}"`));
    const disposeCategory = form.onFieldValueChange('category', (value) => appendLog('value', `分类 → "${String(value)}"`));

    return () => {
      disposeValues();
      disposeTitle();
      disposeCategory();
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [appendLog, autoSave]);

  /* 脏检测 */
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent): void => {
      if (form.modified) {
        e.preventDefault();
        e.returnValue = '您有未保存的更改，确定要离开吗？';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [form]);

  /* 日志滚动 */
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [eventLog]);

  /** 提交 */
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    appendLog('submit', '开始提交...');
    const result = await form.submit();
    if (result.errors.length > 0) {
      const errMsg = result.errors.map((err) => err.message).join(', ');
      appendLog('submit', `提交失败: ${errMsg}`);
      setSubmitResult('验证失败: ' + errMsg);
    } else {
      appendLog('submit', '提交成功');
      setSubmitResult(JSON.stringify(result.values, null, 2));
      localStorage.removeItem(STORAGE_KEY);
      appendLog('autosave', '已清除自动保存数据');
    }
  };

  /** 重置 */
  const handleReset = (): void => {
    form.reset();
    setSubmitResult('');
    localStorage.removeItem(STORAGE_KEY);
    appendLog('reset', '表单已重置');
  };

  const filteredLog = eventFilter === 'all' ? eventLog : eventLog.filter((e) => e.type === eventFilter);

  return (
    <div>
      <Title level={3}>生命周期 - antd 版</Title>
      <Paragraph type="secondary">
        值变化监听 / 焦点事件 / 自动保存(localStorage+防抖) / 脏检测 / 事件日志
      </Paragraph>

      {/* 脏检测 */}
      <div style={{ marginBottom: 16 }}>
        <Badge
          status={form.modified ? 'warning' : 'success'}
          text={form.modified ? '有未保存的更改（关闭页面会弹出确认）' : '没有未保存的更改'}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* 左侧：表单 */}
        <div>
          <FormProvider form={form}>
            <form onSubmit={handleSubmit} noValidate>
              <FormField name="title">
                {(field: FieldInstance) => (
                  <Form.Item label={field.label} required={field.required} validateStatus={field.errors.length > 0 ? 'error' : undefined} help={field.errors[0]?.message}>
                    <Input
                      value={(field.value as string) ?? ''}
                      onChange={(e) => field.setValue(e.target.value)}
                      onFocus={() => { field.focus(); appendLog('focus', `"${field.label}" 获得焦点`); }}
                      onBlur={() => { field.blur(); field.validate('blur').catch(() => {}); appendLog('focus', `"${field.label}" 失去焦点`); }}
                      placeholder="请输入文章标题"
                    />
                  </Form.Item>
                )}
              </FormField>

              <FormField name="content">
                {(field: FieldInstance) => (
                  <Form.Item label={field.label} required={field.required} validateStatus={field.errors.length > 0 ? 'error' : undefined} help={field.errors[0]?.message}>
                    <Input.TextArea
                      value={(field.value as string) ?? ''}
                      onChange={(e) => field.setValue(e.target.value)}
                      onFocus={() => { field.focus(); appendLog('focus', `"${field.label}" 获得焦点`); }}
                      onBlur={() => { field.blur(); field.validate('blur').catch(() => {}); appendLog('focus', `"${field.label}" 失去焦点`); }}
                      rows={4}
                      placeholder="请输入文章内容"
                    />
                  </Form.Item>
                )}
              </FormField>

              <FormField name="category">
                {(field: FieldInstance) => (
                  <Form.Item label={field.label} required={field.required}>
                    <Select
                      value={(field.value as string) ?? undefined}
                      onChange={(val) => field.setValue(val)}
                      onFocus={() => { field.focus(); appendLog('focus', `"${field.label}" 获得焦点`); }}
                      onBlur={() => { field.blur(); appendLog('focus', `"${field.label}" 失去焦点`); }}
                      options={field.dataSource.map((item) => ({ label: item.label, value: item.value }))}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                )}
              </FormField>

              <FormField name="tags">
                {(field: FieldInstance) => (
                  <Form.Item label={field.label} extra={field.description}>
                    <Input
                      value={(field.value as string) ?? ''}
                      onChange={(e) => field.setValue(e.target.value)}
                      onFocus={() => { field.focus(); appendLog('focus', `"${field.label}" 获得焦点`); }}
                      onBlur={() => { field.blur(); appendLog('focus', `"${field.label}" 失去焦点`); }}
                      placeholder="React, TypeScript, MobX"
                    />
                  </Form.Item>
                )}
              </FormField>

              <Space>
                <Button type="primary" htmlType="submit">提交</Button>
                <Button onClick={handleReset}>重置</Button>
              </Space>
            </form>
          </FormProvider>

          {submitResult && (
            <Alert
              style={{ marginTop: 16 }}
              type={submitResult.startsWith('验证失败') ? 'error' : 'success'}
              message="提交结果"
              description={<pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: 12 }}>{submitResult}</pre>}
            />
          )}
        </div>

        {/* 右侧：事件日志 */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Text strong>事件日志</Text>
            <Space size={4}>
              <Segmented
                size="small"
                value={eventFilter}
                onChange={(val) => setEventFilter(val as EventFilter)}
                options={[
                  { label: '全部', value: 'all' },
                  ...(['value', 'focus', 'submit', 'reset', 'autosave'] as const).map((t) => ({
                    label: EVENT_LABELS[t],
                    value: t,
                  })),
                ]}
              />
              <Button size="small" onClick={() => setEventLog([])}>清空</Button>
            </Space>
          </div>
          <div
            style={{
              height: 520,
              overflow: 'auto',
              border: '1px solid #eee',
              borderRadius: 6,
              padding: 8,
              background: '#fafafa',
              fontSize: 12,
              fontFamily: 'monospace',
            }}
          >
            {filteredLog.length === 0 && (
              <div style={{ color: '#999', textAlign: 'center', padding: 20 }}>暂无事件记录</div>
            )}
            {filteredLog.map((entry) => (
              <div
                key={entry.id}
                style={{ marginBottom: 4, padding: '4px 8px', background: '#fff', borderRadius: 4, borderLeft: `3px solid` }}
              >
                <Text type="secondary">[{entry.time}]</Text>{' '}
                <Tag color={EVENT_COLORS[entry.type]} style={{ fontSize: 10 }}>{EVENT_LABELS[entry.type]}</Tag>
                <span style={{ wordBreak: 'break-all' }}>{entry.message}</span>
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
});
