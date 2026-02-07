import { Switch as ASwitch } from 'antd'
import React from 'react'

export interface CfSwitchProps {
  value?: boolean
  onChange?: (value: boolean) => void
  disabled?: boolean
  readOnly?: boolean
}

export function Switch({ value, onChange, disabled, readOnly }: CfSwitchProps): React.ReactElement {
  return <ASwitch checked={value} onChange={onChange} disabled={disabled || readOnly} />
}
