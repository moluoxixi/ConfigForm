/**
 * 场景 34：手写签名板
 *
 * 覆盖：
 * - Canvas 签名板（可接入 signature_pad）
 * - 签名数据同步（Base64）
 * - 清空 / 撤销
 * - 三种模式切换
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { FormProvider, FormField, useCreateForm } from '@moluoxixi/react';
import { setupAntd } from '@moluoxixi/ui-antd';
import { Button, Typography, Alert, Segmented, Form, Input, Space } from 'antd';
import { ClearOutlined } from '@ant-design/icons';
import type { FieldInstance } from '@moluoxixi/core';
import type { FieldPattern } from '@moluoxixi/shared';

const { Title, Paragraph, Text } = Typography;

setupAntd();

const MODE_OPTIONS = [
  { label: '编辑态', value: 'editable' },
  { label: '阅读态', value: 'readOnly' },
  { label: '禁用态', value: 'disabled' },
];

/** Canvas 签名板 */
const SignatureCanvas = ({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (dataUrl: string) => void;
  disabled: boolean;
}): React.ReactElement => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);

  /** 获取绘图上下文 */
  const getCtx = (): CanvasRenderingContext2D | null => canvasRef.current?.getContext('2d') ?? null;

  /** 获取鼠标在 canvas 中的位置 */
  const getPos = (e: React.MouseEvent): { x: number; y: number } => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleMouseDown = (e: React.MouseEvent): void => {
    if (disabled) return;
    isDrawingRef.current = true;
    const ctx = getCtx();
    if (!ctx) return;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const handleMouseMove = (e: React.MouseEvent): void => {
    if (!isDrawingRef.current || disabled) return;
    const ctx = getCtx();
    if (!ctx) return;
    const pos = getPos(e);
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#333';
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const handleMouseUp = (): void => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    const canvas = canvasRef.current;
    if (canvas) onChange(canvas.toDataURL('image/png'));
  };

  /** 清空画布 */
  const clear = useCallback((): void => {
    const ctx = getCtx();
    const canvas = canvasRef.current;
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      onChange('');
    }
  }, [onChange]);

  /* 恢复已有签名 */
  useEffect(() => {
    if (!value) return;
    const ctx = getCtx();
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;
    const img = new Image();
    img.onload = () => { ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.drawImage(img, 0, 0); };
    img.src = value;
  }, []);

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={500}
        height={200}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          border: '1px solid #d9d9d9',
          borderRadius: 8,
          cursor: disabled ? 'not-allowed' : 'crosshair',
          background: disabled ? '#f5f5f5' : '#fff',
          display: 'block',
        }}
      />
      {!disabled && (
        <Button icon={<ClearOutlined />} size="small" onClick={clear} style={{ marginTop: 8 }}>
          清空签名
        </Button>
      )}
    </div>
  );
};

export const SignaturePadForm = observer((): React.ReactElement => {
  const [mode, setMode] = useState<FieldPattern>('editable');
  const [result, setResult] = useState('');

  const form = useCreateForm({
    initialValues: { signerName: '', signatureData: '' },
  });

  useEffect(() => {
    form.createField({ name: 'signerName', label: '签名人', required: true });
    form.createField({ name: 'signatureData', label: '签名' });
  }, []);

  const switchMode = (p: FieldPattern): void => {
    setMode(p);
    ['signerName', 'signatureData'].forEach((n) => { const f = form.getField(n); if (f) f.pattern = p; });
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    const res = await form.submit();
    if (res.errors.length > 0) { setResult('验证失败: ' + res.errors.map((err) => err.message).join(', ')); }
    else {
      const data = { ...res.values, signatureData: (res.values as Record<string, unknown>).signatureData ? '[Base64 Image Data]' : '' };
      setResult(JSON.stringify(data, null, 2));
    }
  };

  return (
    <div>
      <Title level={3}>手写签名板</Title>
      <Paragraph type="secondary">Canvas 手写签名 / Base64 数据同步 / 清空操作 / 三种模式</Paragraph>
      <Segmented value={mode} onChange={(v) => switchMode(v as FieldPattern)} options={MODE_OPTIONS} style={{ marginBottom: 16 }} />

      <FormProvider form={form}>
        <form onSubmit={handleSubmit} noValidate>
          <FormField name="signerName">
            {(field: FieldInstance) => (
              <Form.Item label={field.label} required={field.required}>
                <Input value={(field.value as string) ?? ''} onChange={(e) => field.setValue(e.target.value)} disabled={mode === 'disabled'} readOnly={mode === 'readOnly'} style={{ width: 300 }} />
              </Form.Item>
            )}
          </FormField>
          <FormField name="signatureData">
            {(field: FieldInstance) => (
              <Form.Item label="手写签名">
                {mode === 'readOnly' || mode === 'preview' ? (
                  (field.value as string) ? (
                    <img src={field.value as string} alt="签名" style={{ border: '1px solid #d9d9d9', borderRadius: 8, maxWidth: 500 }} />
                  ) : (
                    <Text type="secondary">暂无签名</Text>
                  )
                ) : (
                  <SignatureCanvas
                    value={(field.value as string) ?? ''}
                    onChange={(v) => field.setValue(v)}
                    disabled={mode === 'disabled'}
                  />
                )}
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
