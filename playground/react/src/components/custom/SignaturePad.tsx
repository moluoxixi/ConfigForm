/**
 * 自定义组件：手写签名板
 *
 * 基于 Canvas 实现的手写签名，输出 Base64 PNG 数据。
 */
import React, { useCallback, useEffect, useRef } from 'react'

interface SignaturePadProps {
  value?: string
  onChange?: (value: string) => void
  disabled?: boolean
  readOnly?: boolean
}

export function SignaturePad({ value, onChange, disabled, readOnly }: SignaturePadProps): React.ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDrawing = useRef(false)

  const getCtx = useCallback((): CanvasRenderingContext2D | null => {
    return canvasRef.current?.getContext('2d') ?? null
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    if (value) {
      const img = new Image()
      img.onload = () => ctx.drawImage(img, 0, 0)
      img.src = value
    }
  }, [])

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (disabled || readOnly) return
    isDrawing.current = true
    const ctx = getCtx()
    if (!ctx) return
    const rect = canvasRef.current!.getBoundingClientRect()
    ctx.beginPath()
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top)
  }, [disabled, readOnly, getCtx])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || disabled || readOnly) return
    const ctx = getCtx()
    if (!ctx) return
    const rect = canvasRef.current!.getBoundingClientRect()
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#333'
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top)
    ctx.stroke()
  }, [disabled, readOnly, getCtx])

  const handleMouseUp = useCallback(() => {
    if (!isDrawing.current) return
    isDrawing.current = false
    const canvas = canvasRef.current
    if (canvas) {
      onChange?.(canvas.toDataURL('image/png'))
    }
  }, [onChange])

  const handleClear = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    onChange?.('')
  }, [onChange])

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={400}
        height={150}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          border: '1px solid #d9d9d9', borderRadius: 6,
          cursor: disabled || readOnly ? 'not-allowed' : 'crosshair',
          display: 'block', background: '#fff',
        }}
      />
      <button
        onClick={handleClear}
        disabled={disabled || readOnly}
        style={{ marginTop: 4, padding: '2px 12px', fontSize: 12, border: '1px solid #d9d9d9', borderRadius: 4, background: '#fff', cursor: 'pointer' }}
      >
        清除
      </button>
    </div>
  )
}
