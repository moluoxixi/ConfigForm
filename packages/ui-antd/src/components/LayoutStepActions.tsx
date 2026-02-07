import { Button as AButton } from 'antd'
import React from 'react'

export interface LayoutStepActionsProps {
  current: number
  total: number
  loading?: boolean
  onPrev?: () => void
  onNext?: () => void
}

export function LayoutStepActions({ current, total, loading, onPrev, onNext }: LayoutStepActionsProps): React.ReactElement {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
      <div>{current > 0 && <AButton onClick={onPrev}>上一步</AButton>}</div>
      {current < total - 1 && <AButton type="primary" loading={loading} onClick={onNext}>下一步</AButton>}
    </div>
  )
}
