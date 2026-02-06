/**
 * 场景 48：打印、导出
 *
 * 覆盖：
 * - 打印预览（window.print）
 * - 导出 JSON
 * - 导出 CSV
 * - 三种模式切换
 */
import React, { useState, useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { FormProvider, FormField, useCreateForm } from '@moluoxixi/react';
import { setupAntd } from '@moluoxixi/ui-antd';
import {
  Button, Typography, Alert, Segmented, Form, Input, InputNumber, Space, Card,
} from 'antd';
import { PrinterOutlined, DownloadOutlined, FileTextOutlined } from '@ant-design/icons';
import type { FieldInstance } from '@moluoxixi/core';
import type { FieldPattern } from '@moluoxixi/shared';

const { Title, Paragraph, Text } = Typography;

setupAntd();

const MODE_OPTIONS = [
  { label: '编辑态', value: 'editable' },
  { label: '阅读态', value: 'readOnly' },
  { label: '禁用态', value: 'disabled' },
];

const FIELDS = [
  { name: 'orderNo', label: '订单号', type: 'text' },
  { name: 'customer', label: '客户名称', type: 'text' },
  { name: 'amount', label: '金额', type: 'number' },
  { name: 'date', label: '日期', type: 'text' },
  { name: 'address', label: '地址', type: 'text' },
  { name: 'remark', label: '备注', type: 'textarea' },
];

/** 下载文件 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export const PrintExportForm = observer((): React.ReactElement => {
  const [mode, setMode] = useState<FieldPattern>('editable');
  const [result, setResult] = useState('');
  const printRef = useRef<HTMLDivElement>(null);

  const form = useCreateForm({
    initialValues: { orderNo: 'ORD-20260207-001', customer: '张三', amount: 9999, date: '2026-02-07', address: '北京市朝阳区', remark: '加急处理' },
  });

  useEffect(() => {
    FIELDS.forEach((d) => form.createField({ name: d.name, label: d.label }));
  }, []);

  const switchMode = (p: FieldPattern): void => {
    setMode(p);
    FIELDS.forEach((d) => { const f = form.getField(d.name); if (f) f.pattern = p; });
  };

  /** 打印 */
  const handlePrint = (): void => {
    const printContent = printRef.current;
    if (!printContent) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>打印预览</title>
      <style>body{font-family:system-ui;padding:20px}table{width:100%;border-collapse:collapse}td,th{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style>
      </head><body>
      <h2>表单数据</h2>
      <table>
      ${FIELDS.map((d) => `<tr><th>${d.label}</th><td>${String(form.getFieldValue(d.name) ?? '')}</td></tr>`).join('')}
      </table>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  /** 导出 JSON */
  const exportJson = (): void => {
    const data: Record<string, unknown> = {};
    FIELDS.forEach((d) => { data[d.name] = form.getFieldValue(d.name); });
    downloadFile(JSON.stringify(data, null, 2), 'form-data.json', 'application/json');
  };

  /** 导出 CSV */
  const exportCsv = (): void => {
    const headers = FIELDS.map((d) => d.label).join(',');
    const values = FIELDS.map((d) => `"${String(form.getFieldValue(d.name) ?? '').replace(/"/g, '""')}"`).join(',');
    downloadFile(`\uFEFF${headers}\n${values}`, 'form-data.csv', 'text/csv;charset=utf-8');
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    const res = await form.submit();
    if (res.errors.length > 0) { setResult('验证失败: ' + res.errors.map((err) => err.message).join(', ')); }
    else { setResult(JSON.stringify(res.values, null, 2)); }
  };

  return (
    <div>
      <Title level={3}>打印、导出</Title>
      <Paragraph type="secondary">打印预览（window.print） / 导出 JSON / 导出 CSV</Paragraph>
      <Segmented value={mode} onChange={(v) => switchMode(v as FieldPattern)} options={MODE_OPTIONS} style={{ marginBottom: 16 }} />

      {/* 工具栏 */}
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<PrinterOutlined />} onClick={handlePrint}>打印</Button>
        <Button icon={<DownloadOutlined />} onClick={exportJson}>导出 JSON</Button>
        <Button icon={<FileTextOutlined />} onClick={exportCsv}>导出 CSV</Button>
      </Space>

      <div ref={printRef}>
        <FormProvider form={form}>
          <form onSubmit={handleSubmit} noValidate>
            {FIELDS.map((d) => (
              <FormField key={d.name} name={d.name}>
                {(field: FieldInstance) => (
                  <Form.Item label={d.label}>
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
            ))}
            {mode === 'editable' && <Button type="primary" htmlType="submit">提交</Button>}
          </form>
        </FormProvider>
      </div>

      {result && (<Alert style={{ marginTop: 16 }} type={result.startsWith('验证失败') ? 'error' : 'success'} message="提交结果" description={<pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{result}</pre>} />)}
    </div>
  );
});
