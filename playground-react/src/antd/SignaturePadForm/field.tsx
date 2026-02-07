import { ClearOutlined } from '@ant-design/icons'
import { FormField, FormProvider, registerComponent, useCreateForm } from '@moluoxixi/react'
import { LayoutFormActions, StatusTabs, setupAntd } from '@moluoxixi/ui-antd'
import { Button, Typography } from 'antd'
import { observer } from 'mobx-react-lite'
/**
 * 场景 34：手写签名板
 *
 * 覆盖：
 * - Canvas 签名板（可接入 signature_pad）
 * - 签名数据同步（Base64）
 * - 清空 / 撤销
 * - 三种模式切换
 */
import React, { useCallback, useEffect, useRef } from 'react'

const { Title, Paragraph, Text } = Typography

setupAntd()

/** Canvas 签名板常量 */
const CANVAS_WIDTH = 500
const CANVAS_HEIGHT = 200

/** 签名板组件 Props */
interface SignaturePadProps {
  value: string
  onChange: (dataUrl: string) => void
  disabled: boolean
  readOnly: boolean
}

/**
 * Canvas 手写签名自定义组件
 *
 * - 编辑态：Canvas 画布 + 清空按钮
 * - 禁用态：禁用 Canvas（不可绘制）
 * - 只读态：Base64 图片或占位文字
 */
const SignaturePad = observer(({ value, onChange, disabled, readOnly }: SignaturePadProps): React.ReactElement => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDrawingRef = useRef(false)

  /** 获取 Canvas 2D 上下文 */
  const getCtx = (): CanvasRenderingContext2D | null => canvasRef.current?.getContext('2d') ?? null

  /** 获取鼠标相对 Canvas 的坐标 */
  const getPos = (e: React.MouseEvent): { x: number; y: number } => {
    const rect = canvasRef.current!.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  /** 开始绘制 */
  const handleMouseDown = (e: React.MouseEvent): void => {
    if (disabled) return
    isDrawingRef.current = true
    const ctx = getCtx()
    if (!ctx) return
    const pos = getPos(e)
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
  }

  /** 绘制中 */
  const handleMouseMove = (e: React.MouseEvent): void => {
    if (!isDrawingRef.current || disabled) return
    const ctx = getCtx()
    if (!ctx) return
    const pos = getPos(e)
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#333'
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
  }

  /** 结束绘制，输出 Base64 */
  const handleMouseUp = (): void => {
    if (!isDrawingRef.current) return
    isDrawingRef.current = false
    const canvas = canvasRef.current
    if (canvas) onChange(canvas.toDataURL('image/png'))
  }

  /** 清空画布 */
  const clear = useCallback((): void => {
    const ctx = getCtx()
    const canvas = canvasRef.current
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      onChange('')
    }
  }, [onChange])

  /* 恢复已有签名 */
  useEffect(() => {
    if (!value) return
    const ctx = getCtx()
    const canvas = canvasRef.current
    if (!ctx || !canvas) return
    const img = new Image()
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)
    }
    img.src = value
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  /* 只读态：Base64 图片或占位文字 */
  if (readOnly) {
    if (value) {
      return <img src={value} alt="签名" style={{ border: '1px solid #d9d9d9', borderRadius: 8, maxWidth: 500 }} />
    }
    return <Text type="secondary">暂无签名</Text>
  }

  /* 编辑/禁用态：Canvas + 清空按钮 */
  return (
    <div>
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
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
  )
})

registerComponent('SignaturePad', SignaturePad, { defaultWrapper: 'FormItem' })

export const SignaturePadForm = observer((): React.ReactElement => {
  const form = useCreateForm({
    initialValues: { signerName: '', signatureData: '' },
  })

  return (
    <div>
      <Title level={3}>手写签名板</Title>
      <Paragraph type="secondary">Canvas 手写签名 / Base64 数据同步 / 清空操作 / 三种模式</Paragraph>
      <StatusTabs>
        {({ mode, showResult, showErrors }) => {
          form.pattern = mode
          return (
            <FormProvider form={form}>
              <form onSubmit={async (e: React.FormEvent) => {
                e.preventDefault()
                const res = await form.submit()
                if (res.errors.length > 0) showErrors(res.errors)
                else showResult(res.values)
              }} noValidate>
                <FormField name="signerName" fieldProps={{ label: '签名人', required: true, component: 'Input', componentProps: { style: { width: 300 } } }} />
                <FormField name="signatureData" fieldProps={{ label: '手写签名', component: 'SignaturePad' }} />
                {mode === 'editable' && <LayoutFormActions onReset={() => form.reset()} />}
              </form>
            </FormProvider>
          )
        }}
      </StatusTabs>
    </div>
  )
})
