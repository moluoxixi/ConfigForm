/**
 * 场景 50：Effects 副作用联动（Ant Design 版）
 *
 * 使用 createForm 的 effects 参数实现字段联动计算
 * - onValuesChange：监听所有值变化
 * - onFieldValueChange：监听单个字段值变化并自动计算
 * - setFieldValue 驱动自动计算
 */
import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { createForm } from '@moluoxixi/core';
import type { FieldPattern } from '@moluoxixi/core';
import { FormField, FormProvider } from '@moluoxixi/react';
import { setupAntd, StatusTabs } from '@moluoxixi/ui-antd';

setupAntd();

/** 日志最大条数 */
const MAX_LOGS = 50;

/**
 * Effects 副作用联动示例
 *
 * onFieldValueChange 监听单价/数量/折扣变化，自动计算总价和实付金额。
 */
export const EffectsForm = observer((): React.ReactElement => {
  const [logs, setLogs] = useState<Array<{ type: string; message: string }>>([]);

  /** 表单实例（仅初始化一次） */
  const [form] = useState(() => {
    /** 添加一条日志（通过闭包捕获 setLogs） */
    function addLog(type: string, message: string): void {
      setLogs(prev => {
        const next = [{ type, message }, ...prev];
        return next.length > MAX_LOGS ? next.slice(0, MAX_LOGS) : next;
      });
    }

    return createForm({
      initialValues: {
        unitPrice: 100,
        quantity: 1,
        totalPrice: 100,
        discount: 0,
        finalPrice: 100,
      },
      effects: (f) => {
        /* 监听所有值变化 */
        f.onValuesChange(() => {
          addLog('values', `表单值变化 ${JSON.stringify(f.values).slice(0, 80)}...`);
        });

        /* 单价变化 → 重算总价 */
        f.onFieldValueChange('unitPrice', (val) => {
          addLog('field', `单价→ ${val}`);
          const qty = f.getFieldValue('quantity') as number ?? 0;
          f.setFieldValue('totalPrice', (val as number ?? 0) * qty);
        });

        /* 数量变化 → 重算总价 */
        f.onFieldValueChange('quantity', (val) => {
          addLog('field', `数量→ ${val}`);
          const price = f.getFieldValue('unitPrice') as number ?? 0;
          f.setFieldValue('totalPrice', price * (val as number ?? 0));
        });

        /* 总价变化 → 重算实付 */
        f.onFieldValueChange('totalPrice', (val) => {
          addLog('field', `总价→ ${val}`);
          const discount = f.getFieldValue('discount') as number ?? 0;
          f.setFieldValue('finalPrice', (val as number ?? 0) * (1 - discount / 100));
        });

        /* 折扣变化 → 重算实付 */
        f.onFieldValueChange('discount', (val) => {
          addLog('field', `折扣→ ${val}%`);
          const total = f.getFieldValue('totalPrice') as number ?? 0;
          f.setFieldValue('finalPrice', total * (1 - (val as number ?? 0) / 100));
        });
      },
    });
  });

  /** 提交处理 */
  const handleSubmit = async (showResult: (data: Record<string, unknown>) => void, showErrors: (errors: unknown[]) => void): Promise<void> => {
    const res = await form.submit();
    if (res.errors.length > 0) {
      showErrors(res.errors);
    } else {
      showResult(res.values);
    }
  };

  return (
    <div>
      <h2>Effects 副作用联动</h2>
      <p style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 16, fontSize: 14 }}>
        使用 createForm({'{ effects }'}) 实现字段联动计算 — onFieldValueChange / onValuesChange 自动计算总价和实付金额
      </p>
      <StatusTabs>
        {({ mode, showResult, showErrors }) => {
          form.pattern = mode as FieldPattern;
          return (
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <FormProvider form={form}>
                  <FormField name="unitPrice" fieldProps={{ label: '单价', component: 'InputNumber', componentProps: { min: 0 } }} />
                  <FormField name="quantity" fieldProps={{ label: '数量', component: 'InputNumber', componentProps: { min: 1 } }} />
                  <FormField name="totalPrice" fieldProps={{ label: '总价（自动计算）', component: 'InputNumber', disabled: true }} />
                  <FormField name="discount" fieldProps={{ label: '折扣(%)', component: 'InputNumber', componentProps: { min: 0, max: 100 } }} />
                  <FormField name="finalPrice" fieldProps={{ label: '实付（自动计算）', component: 'InputNumber', disabled: true }} />
                  {mode === 'editable' && (
                    <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                      <button
                        type="button"
                        style={{ padding: '4px 15px', background: '#1677ff', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}
                        onClick={() => handleSubmit(showResult, showErrors)}
                      >
                        提交
                      </button>
                      <button
                        type="button"
                        style={{ padding: '4px 15px', background: '#fff', border: '1px solid #d9d9d9', borderRadius: 6, cursor: 'pointer' }}
                        onClick={() => form.reset()}
                      >
                        重置
                      </button>
                    </div>
                  )}
                </FormProvider>
              </div>
              {/* Effects 日志面板 */}
              <div style={{ width: 320, border: '1px solid #eee', borderRadius: 8, padding: 12, background: '#fafafa', maxHeight: 500, overflow: 'auto' }}>
                <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 13 }}>Effects 日志</div>
                {logs.map((log, i) => (
                  <div key={i} style={{ fontSize: 12, color: '#666', borderBottom: '1px solid #f0f0f0', padding: '4px 0' }}>
                    <span style={{ color: '#1677ff' }}>[{log.type}]</span> {log.message}
                  </div>
                ))}
                {logs.length === 0 && (
                  <div style={{ color: '#999', fontSize: 12 }}>等待操作...</div>
                )}
              </div>
            </div>
          );
        }}
      </StatusTabs>
    </div>
  );
});
