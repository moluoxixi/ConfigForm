import { Rate as ARate } from 'antd'
import type { ReactElement } from 'react'

export interface CfRateProps {
  value?: number
  onChange?: (value: number) => void
  disabled?: boolean
  readOnly?: boolean
  count?: number
  allowHalf?: boolean
}

export function Rate({ value, onChange, disabled, readOnly, count = 5, allowHalf = false }: CfRateProps): ReactElement {
  return (
    <ARate
      value={value}
      onChange={onChange}
      disabled={disabled || readOnly}
      count={count}
      allowHalf={allowHalf}
    />
  )
}
