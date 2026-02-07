import type { DataSourceItem } from '@moluoxixi/shared'
import type { ReactElement } from 'react'
import { Radio as ARadio } from 'antd'

export interface CfRadioGroupProps {
  value?: unknown
  onChange?: (value: unknown) => void
  onFocus?: () => void
  onBlur?: () => void
  dataSource?: DataSourceItem[]
  disabled?: boolean
  readOnly?: boolean
}

export function RadioGroup({ value, onChange, onFocus, onBlur, dataSource = [], disabled, readOnly }: CfRadioGroupProps): ReactElement {
  if (readOnly) {
    const selectedItem = dataSource.find(item => item.value === value)
    return <span>{selectedItem?.label || (value ? String(value) : '—')}</span>
  }

  return (
    <div onFocus={onFocus} onBlur={onBlur}>
      <ARadio.Group
        value={value}
        onChange={e => onChange?.(e.target.value)}
        disabled={disabled}
        options={dataSource.map(item => ({ label: item.label, value: item.value }))}
      />
    </div>
  )
}
