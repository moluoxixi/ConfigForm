import { Button as AButton } from 'antd'
import React from 'react'

export interface LayoutFormActionsProps {
  showSubmit?: boolean
  showReset?: boolean
  submitLabel?: string
  resetLabel?: string
  onReset?: () => void
}

/** 表单操作按钮（提交 + 重置），居中排列 */
export function LayoutFormActions({ showSubmit = true, showReset = true, submitLabel = '提交', resetLabel = '重置', onReset }: LayoutFormActionsProps): React.ReactElement {
  return (
    <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center', gap: 8 }}>
      {showSubmit && <AButton type="primary" htmlType="submit">{submitLabel}</AButton>}
      {showReset && <AButton onClick={onReset}>{resetLabel}</AButton>}
    </div>
  )
}
