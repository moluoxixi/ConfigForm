import type { DataSourceItem } from '@moluoxixi/shared'
import { Radio as ARadio } from 'antd'
import React from 'react'

export interface CfRadioGroupProps {
  value?: unknown
  onChange?: (value: unknown) => void
  dataSource?: DataSourceItem[]
  disabled?: boolean
  readOnly?: boolean
}

export function RadioGroup({ value, onChange, dataSource = [], disabled, readOnly }: CfRadioGroupProps): React.ReactElement {
  return (
    <ARadio.Group
      value={value}
      onChange={e => onChange?.(e.target.value)}
      disabled={disabled || readOnly}
      options={dataSource.map(item => ({ label: item.label, value: item.value }))}
    />
  )
}
