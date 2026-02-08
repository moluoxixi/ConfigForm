import type { ISchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/shared'
import { ClearOutlined } from '@ant-design/icons'
import { ConfigForm, registerComponent } from '@moluoxixi/react'
import { setupAntd, StatusTabs } from '@moluoxixi/ui-antd'
import { observer } from 'mobx-react-lite'
/**
 * 场景 34：手写签名板 — ConfigForm + Schema
 *
 * 覆盖：
 * - 自定义 SignaturePad 组件注册
 * - Canvas 签名板
 * - 签名数据同步（Base64）
 * - 清空操作
 * - 三种模式切换
 */
import React, { useCallback, useEffect, useRef } from 'react'

setupAntd()

/** 工具：将 StatusTabs 的 mode 注入 schema */
function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}

// ========== 自定义组件：手写签名板 ==========

/** Canvas 签名板常量 */
const CANVAS_WIDTH = 500
const CANVAS_HEIGHT = 200

/** 签名板组件 Props */
interface SignaturePadProps {
  /** 签名数据（Base64） */
  value?: string
  /** 值变更回调 */
  onChange?: (dataUrl: string) => void
  /** 是否禁用 */
  disabled?: boolean
  /** 是否只读 */
  readOnly?: boolean
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
    if (canvas) onChange?.(canvas.toDataURL('image/png'))
  }

  /** 清空画布 */
  const clear = useCallback((): void => {
    const ctx = getCtx()
    const canvas = canvasRef.current
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      onChange?.('')
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
    return <span style={{ color: 'rgba(0,0,0,0.45)' }}>暂无签名</span>
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
        <button type="button" onClick={clear} style={{ marginTop: 8, padding: '2px 8px', border: '1px solid #d9d9d9', borderRadius: 4, background: '#fff', cursor: 'pointer', fontSize: 13 }}>
          <ClearOutlined style={{ marginRight: 4 }} />
          清空签名
        </button>
      )}
    </div>
  )
})

registerComponent('SignaturePad', SignaturePad, { defaultWrapper: 'FormItem' })

// ========== Schema & 初始值 ==========

/** 默认初始值 */
const INITIAL_VALUES: Record<string, unknown> = {
  signerName: '',
  signatureData: '',
}

/** 表单 Schema */
const schema: ISchema = {
  type: 'object',
  decoratorProps: {
    labelPosition: 'right',
    labelWidth: '120px',
    actions: { submit: '提交', reset: '重置' },
  },
  properties: {
    signerName: {
      type: 'string',
      title: '签名人',
      required: true,
      component: 'Input',
      componentProps: { style: { width: 300 } },
    },
    signatureData: {
      type: 'string',
      title: '手写签名',
      component: 'SignaturePad',
    },
  },
}

/**
 * 手写签名板表单 — ConfigForm + Schema
 *
 * 展示 Canvas 手写签名、Base64 数据同步、三种模式切换
 */
export const SignaturePadForm = observer((): React.ReactElement => (
  <div>
    <h2>手写签名板</h2>
    <p style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 16, fontSize: 14 }}>Canvas 手写签名 / Base64 数据同步 / 清空操作 / 三种模式 — ConfigForm + Schema</p>
    <StatusTabs>
      {({ mode, showResult, showErrors }) => (
        <ConfigForm
          schema={withMode(schema, mode)}
          initialValues={INITIAL_VALUES}
          onSubmit={showResult}
          onSubmitFailed={errors => showErrors(errors)}
        />
      )}
    </StatusTabs>
  </div>
))
