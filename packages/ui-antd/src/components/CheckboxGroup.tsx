import type { DataSourceItem } from '@moluoxixi/shared'
import { Checkbox as ACheckbox } from 'antd'
import React from 'react'

export interface CfCheckboxGroupProps {
  value?: unknown[]
  onChange?: (value: unknown[]) => void
  dataSource?: DataSourceItem[]
  disabled?: boolean
  readOnly?: boolean
}

export function CheckboxGroup({ value, onChange, dataSource = [], disabled, readOnly }: CfCheckboxGroupProps): React.ReactElement {
  return (
    <ACheckbox.Group
      value={value}
      onChange={v => onChange?.(v)}
      disabled={disabled || readOnly}
      options={dataSource.map(item => ({ label: item.label, value: item.value as string }))}
    />
  )
}
