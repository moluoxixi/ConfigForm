/**
 * 场景 34：手写签名板
 *
 * 覆盖：
 * - Canvas 签名板（可接入 signature_pad）
 * - 签名数据同步（Base64）
 * - 清空 / 撤销
 * - 三种模式切换
 */
import React, { useEffect, useRef, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { FormProvider, FormField, useCreateForm } from '@moluoxixi/react';
import { setupAntd, StatusTabs } from '@moluoxixi/ui-antd';
import { Button, Typography, Form, Input } from 'antd';
import { ClearOutlined } from '@ant-design/icons';
import type { FieldInstance } from '@moluoxixi/core';

const { Title, Paragraph, Text } = Typography;

setupAntd();

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
  const form = useCreateForm({
    initialValues: { signerName: '', signatureData: '' },
  });

  useEffect(() => {
    form.createField({ name: 'signerName', label: '签名人', required: true });
    form.createField({ name: 'signatureData', label: '签名' });
  }, []);

  return (
    <div>
      <Title level={3}>手写签名板</Title>
      <Paragraph type="secondary">Canvas 手写签名 / Base64 数据同步 / 清空操作 / 三种模式</Paragraph>
      <StatusTabs>
        {({ mode, showResult, showErrors }) => {
          form.pattern = mode;
          return (
          <FormProvider form={form}>
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
          </FormProvider>
          );
        }}
      </StatusTabs>
    </div>
  );
});
