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
  return (
    <ASelect
      value={value}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
      placeholder={placeholder}
      disabled={disabled || readOnly}
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
