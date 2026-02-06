/**
 * 数据处理 - antd 版
 *
 * 覆盖场景：
 * - 值格式化（format：金额→¥1,234.56）
 * - 值解析（parse：千分位→数字）
 * - 提交前转换（transform：元→分）
 * - 路径映射（submitPath）
 * - 隐藏字段排除（excludeWhenHidden）
 * - 脏检测（form.modified）
 * - 值变化日志
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { FormProvider, FormField, useCreateForm } from '@moluoxixi/react';
import { setupAntd } from '@moluoxixi/ui-antd';
import {
  Button, Typography, Alert, Input, Switch, Form, Space, Badge, Tag, List,
} from 'antd';
import type { FieldInstance } from '@moluoxixi/core';

const { Title, Paragraph, Text } = Typography;

setupAntd();

/** 值变化日志条目 */
interface ChangeLogEntry {
  time: string;
  field: string;
  value: unknown;
}

/** 将数字格式化为千分位货币显示 */
function formatCurrency(val: unknown): string {
  const num = Number(val);
  if (Number.isNaN(num) || val === '' || val === null || val === undefined) return '';
  return `¥${num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** 解析千分位输入为数字 */
function parseCurrencyInput(input: unknown): number {
  if (typeof input !== 'string') return Number(input) || 0;
  const cleaned = input.replace(/[¥,\s]/g, '');
  const num = Number(cleaned);
  return Number.isNaN(num) ? 0 : num;
}

/** 元转分 */
function yuanToFen(val: unknown): number {
  return Math.round(Number(val) * 100);
}

/** 去除空字符串 */
function trimEmpty(val: unknown): unknown {
  if (typeof val === 'string' && val.trim() === '') return undefined;
  return val;
}

/** 当前时间 */
function now(): string {
  return new Date().toLocaleTimeString('zh-CN', { hour12: false });
}

/** 最大日志条数 */
const MAX_LOG_COUNT = 50;

/**
 * 数据处理示例
 */
export const DataProcessForm = observer(() => {
  const form = useCreateForm({
    initialValues: {
      productName: '示例商品',
      price: 1234.56,
      discount: 0.85,
      hasRemark: true,
      remark: '这是备注',
      internalCode: 'SKU-001',
    },
  });

  const [submitResult, setSubmitResult] = useState('');
  const [changeLog, setChangeLog] = useState<ChangeLogEntry[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);

  /** 追加日志 */
  const appendLog = useCallback((field: string, value: unknown): void => {
    setChangeLog((prev) => {
      const next = [...prev, { time: now(), field, value }];
      return next.length > MAX_LOG_COUNT ? next.slice(-MAX_LOG_COUNT) : next;
    });
  }, []);

  /* 创建字段 */
  useEffect(() => {
    form.createField({ name: 'productName', label: '商品名称', required: true, transform: trimEmpty });
    form.createField({
      name: 'price',
      label: '价格（元）',
      required: true,
      format: formatCurrency,
      parse: parseCurrencyInput,
      transform: yuanToFen,
      submitPath: 'pricing.amountInFen',
    });
    form.createField({
      name: 'discount',
      label: '折扣',
      required: true,
      format: (val: unknown): string => {
        const num = Number(val);
        if (Number.isNaN(num)) return '';
        return `${(num * 100).toFixed(0)}%`;
      },
      parse: (input: unknown): number => {
        const str = String(input).replace('%', '');
        const num = Number(str);
        if (Number.isNaN(num)) return 0;
        return num > 1 ? num / 100 : num;
      },
      submitPath: 'pricing.discount',
    });
    form.createField({ name: 'hasRemark', label: '添加备注' });
    form.createField({
      name: 'remark',
      label: '备注',
      excludeWhenHidden: true,
      transform: trimEmpty,
      reactions: [
        {
          watch: 'hasRemark',
          fulfill: {
            run: (field, ctx) => {
              if (ctx.values.hasRemark) {
                field.show();
              } else {
                field.hide();
              }
            },
          },
        },
      ],
    });
    form.createField({
      name: 'internalCode',
      label: '内部编码',
      submitPath: 'meta.internalCode',
      transform: trimEmpty,
    });

    const disposeValues = form.onValuesChange((values) => appendLog('【全量】', values));
    const disposePrice = form.onFieldValueChange('price', (value) => appendLog('price', value));

    return () => {
      disposeValues();
      disposePrice();
    };
  }, [appendLog]);

  /* 日志滚动到底部 */
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [changeLog]);

  /** 提交 */
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    const result = await form.submit();
    if (result.errors.length > 0) {
      setSubmitResult('验证失败: ' + result.errors.map((err) => err.message).join(', '));
    } else {
      setSubmitResult(JSON.stringify(result.values, null, 2));
    }
  };

  /** 重置 */
  const handleReset = (): void => {
    form.reset();
    setSubmitResult('');
    setChangeLog([]);
  };

  return (
    <div>
      <Title level={3}>数据处理 - antd 版</Title>
      <Paragraph type="secondary">
        format / parse / transform / submitPath / excludeWhenHidden / 脏检测 / 变化日志
      </Paragraph>

      {/* 脏检测指示器 */}
      <div style={{ marginBottom: 16 }}>
        <Badge status={form.modified ? 'warning' : 'success'} text={form.modified ? '已修改（有未保存的更改）' : '未修改'} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* 左侧：表单 */}
        <div>
          <FormProvider form={form}>
            <form onSubmit={handleSubmit} noValidate>
              {/* 商品名称 */}
              <FormField name="productName">
                {(field: FieldInstance) => (
                  <Form.Item label={field.label} required={field.required} validateStatus={field.errors.length > 0 ? 'error' : undefined} help={field.errors[0]?.message}>
                    <Input
                      value={(field.value as string) ?? ''}
                      onChange={(e) => field.setValue(e.target.value)}
                      onBlur={() => { field.blur(); field.validate('blur').catch(() => {}); }}
                    />
                  </Form.Item>
                )}
              </FormField>

              {/* 价格（格式化/解析） */}
              <FormField name="price">
                {(field: FieldInstance) => {
                  const displayValue = field.format ? String(field.format(field.value)) : String(field.value ?? '');
                  return (
                    <Form.Item label={field.label} required={field.required} validateStatus={field.errors.length > 0 ? 'error' : undefined} help={field.errors[0]?.message}>
                      <Input
                        value={displayValue}
                        onChange={(e) => {
                          const parsed = field.parse ? field.parse(e.target.value) : e.target.value;
                          field.setValue(parsed);
                        }}
                        placeholder="输入金额"
                      />
                      <div style={{ marginTop: 4 }}>
                        <Tag>存储值: {String(field.value)}</Tag>
                        <Tag color="green">提交值(分): {field.transform ? String(field.transform(field.value)) : '-'}</Tag>
                      </div>
                    </Form.Item>
                  );
                }}
              </FormField>

              {/* 折扣 */}
              <FormField name="discount">
                {(field: FieldInstance) => {
                  const displayValue = field.format ? String(field.format(field.value)) : String(field.value ?? '');
                  return (
                    <Form.Item label={field.label} required={field.required}>
                      <Input
                        value={displayValue}
                        onChange={(e) => {
                          const parsed = field.parse ? field.parse(e.target.value) : e.target.value;
                          field.setValue(parsed);
                        }}
                        placeholder="如 0.85 或 85%"
                      />
                      <Tag style={{ marginTop: 4 }}>存储值: {String(field.value)}</Tag>
                    </Form.Item>
                  );
                }}
              </FormField>

              {/* 备注开关 */}
              <FormField name="hasRemark">
                {(field: FieldInstance) => (
                  <Form.Item label={field.label}>
                    <Switch checked={!!field.value} onChange={(checked) => field.setValue(checked)} />
                  </Form.Item>
                )}
              </FormField>

              {/* 备注 */}
              <FormField name="remark">
                {(field: FieldInstance) => {
                  if (!field.visible) return null;
                  return (
                    <Form.Item label={<>{field.label} <Tag>隐藏时不提交</Tag></>}>
                      <Input.TextArea
                        value={(field.value as string) ?? ''}
                        onChange={(e) => field.setValue(e.target.value)}
                        rows={3}
                      />
                    </Form.Item>
                  );
                }}
              </FormField>

              {/* 内部编码 */}
              <FormField name="internalCode">
                {(field: FieldInstance) => (
                  <Form.Item label={<>{field.label} <Tag>submitPath: meta.internalCode</Tag></>}>
                    <Input
                      value={(field.value as string) ?? ''}
                      onChange={(e) => field.setValue(e.target.value)}
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
              message="提交数据（transform + submitPath 映射后）"
              description={<pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: 12 }}>{submitResult}</pre>}
            />
          )}
        </div>

        {/* 右侧：值变化日志 */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text strong>值变化日志</Text>
            <Button size="small" onClick={() => setChangeLog([])}>清空</Button>
          </div>
          <div
            style={{
              height: 500,
              overflow: 'auto',
              border: '1px solid #eee',
              borderRadius: 6,
              padding: 8,
              background: '#fafafa',
              fontSize: 12,
              fontFamily: 'monospace',
            }}
          >
            {changeLog.length === 0 && (
              <div style={{ color: '#999', textAlign: 'center', padding: 20 }}>暂无记录</div>
            )}
            {changeLog.map((entry, i) => (
              <div key={i} style={{ marginBottom: 4, padding: '4px 8px', background: '#fff', borderRadius: 4, borderLeft: '3px solid #1677ff' }}>
                <Text type="secondary">[{entry.time}]</Text>{' '}
                <Text type="success" strong>{entry.field}</Text>:{' '}
                <span>{typeof entry.value === 'object' ? JSON.stringify(entry.value) : String(entry.value)}</span>
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
});
