/**
 * 自定义组件：手写签名板
 *
 * 基于 Canvas 实现的手写签名，输出 Base64 PNG 数据。
 */
import React, { useCallback, useEffect, useRef } from 'react'

/**
 * Signature Pad Props：描述该模块对外暴露的数据结构。
 * 所属模块：`playground/react/src/components/custom/SignaturePad.tsx`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
interface SignaturePadProps {
  value?: string
  onChange?: (value: string) => void
  disabled?: boolean
  preview?: boolean
}

/**
 * Signature Pad：封装该模块的核心渲染与交互逻辑。
 * 所属模块：`playground/react/src/components/custom/SignaturePad.tsx`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param param1 组件入参对象。
 * @param param1.value 当前签名图片数据（Base64）。
 * @param param1.onChange 签名变更回调。
 * @param param1.disabled 是否禁用交互。
 * @param param1.preview 是否处于预览态。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
 */
export function SignaturePad({ value, onChange, disabled, preview }: SignaturePadProps): React.ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDrawing = useRef(false)

  const getCtx = useCallback((): CanvasRenderingContext2D | null => {
    return canvasRef.current?.getContext('2d') ?? null
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas)
      return
    const ctx = canvas.getContext('2d')
    if (!ctx)
      return

    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    if (value) {
      const img = new Image()
      img.onload = () => ctx.drawImage(img, 0, 0)
      img.src = value
    }
  }, [])

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (disabled || preview)
      return
    isDrawing.current = true
    const ctx = getCtx()
    if (!ctx)
      return
    const rect = canvasRef.current!.getBoundingClientRect()
    ctx.beginPath()
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top)
  }, [disabled, preview, getCtx])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || disabled || preview)
      return
    const ctx = getCtx()
    if (!ctx)
      return
    const rect = canvasRef.current!.getBoundingClientRect()
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#333'
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top)
    ctx.stroke()
  }, [disabled, preview, getCtx])

  const handleMouseUp = useCallback(() => {
    if (!isDrawing.current)
      return
    isDrawing.current = false
    const canvas = canvasRef.current
    if (canvas) {
      onChange?.(canvas.toDataURL('image/png'))
    }
  }, [onChange])

  const handleClear = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas)
      return
    const ctx = canvas.getContext('2d')
    if (!ctx)
      return
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
          border: '1px solid #d9d9d9',
          borderRadius: 6,
          cursor: disabled || preview ? 'not-allowed' : 'crosshair',
          display: 'block',
          background: '#fff',
        }}
      />
      <button
        onClick={handleClear}
        disabled={disabled || preview}
        style={{ marginTop: 4, padding: '2px 12px', fontSize: 12, border: '1px solid #d9d9d9', borderRadius: 4, background: '#fff', cursor: 'pointer' }}
      >
        清除
      </button>
    </div>
  )
}
