import type { DataSourceItem } from '@moluoxixi/shared'
import { Select as ASelect } from 'antd'
import React from 'react'

export interface CfSelectProps {
  value?: unknown
  onChange?: (value: unknown) => void
  onFocus?: () => void
  onBlur?: () => void
  dataSource?: DataSourceItem[]
  placeholder?: string
  disabled?: boolean
  readOnly?: boolean
  loading?: boolean
  mode?: 'multiple' | 'tags'
}

export function Select({ value, onChange, onFocus, onBlur, dataSource = [], placeholder, disabled, readOnly, loading, mode }: CfSelectProps): React.ReactElement {
  if (readOnly) {
    const selectedLabel = dataSource.find(item => item.value === value)?.label
    return <span>{selectedLabel ?? (value ? String(value) : '—')}</span>
  }

  return (
    <ASelect
      value={value}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
      placeholder={placeholder}
      disabled={disabled}
      loading={loading}
      mode={mode}
      style={{ width: '100%' }}
      options={dataSource.map(item => ({
        label: item.label,
        value: item.value,
        disabled: item.disabled,
      }))}
    />
  )
}
