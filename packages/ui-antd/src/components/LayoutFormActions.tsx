import { FormContext } from '@moluoxixi/react'
import { Button as AButton } from 'antd'
import React, { useCallback, useContext } from 'react'

export interface LayoutFormActionsProps {
  showSubmit?: boolean
  showReset?: boolean
  submitLabel?: string
  resetLabel?: string
  align?: 'left' | 'center' | 'right'
  onSubmit?: (values: Record<string, unknown>) => void
  onSubmitFailed?: (errors: unknown[]) => void
  onReset?: () => void
}

/**
 * 表单操作按钮（提交 + 重置）
 *
 * 参考 Formily Submit/Reset 组件。
 * 自动从 FormContext 获取 form 实例，直接调用 form.submit() / form.reset()。
 * 无需外层包裹 <form> 标签。
 */
export function LayoutFormActions({
  showSubmit = true,
  showReset = true,
  submitLabel = '提交',
  resetLabel = '重置',
  align = 'center',
  onSubmit,
  onSubmitFailed,
  onReset,
}: LayoutFormActionsProps): React.ReactElement {
  const form = useContext(FormContext)

  const handleSubmit = useCallback(async () => {
    if (!form)
      return
    const result = await form.submit()
    if (result.errors.length > 0) {
      onSubmitFailed?.(result.errors)
    }
    else {
      onSubmit?.(result.values)
    }
  }, [form, onSubmit, onSubmitFailed])

  const handleReset = useCallback(() => {
    form?.reset()
    onReset?.()
  }, [form, onReset])

  /** preview/disabled 模式下自动隐藏操作按钮 */
  if (form && form.pattern !== 'editable') {
    return <></>
  }

  const justifyContent = align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center'

  return (
    <div style={{ marginTop: 24, display: 'flex', justifyContent, gap: 8 }}>
      {showSubmit && <AButton type="primary" onClick={handleSubmit}>{submitLabel}</AButton>}
      {showReset && <AButton onClick={handleReset}>{resetLabel}</AButton>}
    </div>
  )
}
