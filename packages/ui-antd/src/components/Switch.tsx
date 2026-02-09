import type { ReactElement } from 'react'
import { Switch as ASwitch } from 'antd'

export interface CfSwitchProps {
  value?: boolean
  onChange?: (value: boolean) => void
  onFocus?: () => void
  onBlur?: () => void
  disabled?: boolean
  preview?: boolean
}

export function Switch({ value, onChange, onFocus, onBlur, disabled, preview }: CfSwitchProps): ReactElement {
  return (
    <span onFocus={onFocus} onBlur={onBlur}>
      <ASwitch checked={value} onChange={onChange} disabled={disabled} />
    </span>
  )
}
