import type { DataSourceItem } from '@moluoxixi/core'
import type { ReactElement } from 'react'
import { Checkbox as ACheckbox } from 'antd'

export interface CfCheckboxGroupProps {
  value?: unknown[]
  onChange?: (value: unknown[]) => void
  onFocus?: () => void
  onBlur?: () => void
  dataSource?: DataSourceItem[]
  disabled?: boolean
  preview?: boolean
}

export function CheckboxGroup({ value, onChange, onFocus, onBlur, dataSource = [], disabled, preview }: CfCheckboxGroupProps): ReactElement {
  return (
    <div onFocus={onFocus} onBlur={onBlur}>
      <ACheckbox.Group
        value={value}
        onChange={v => onChange?.(v)}
        disabled={disabled}
        options={dataSource.map(item => ({ label: item.label, value: item.value as string }))}
      />
    </div>
  )
}
