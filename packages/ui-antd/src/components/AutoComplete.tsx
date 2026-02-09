import type { DataSourceItem } from '@moluoxixi/core'
import { AutoComplete as AAutoComplete } from 'antd'
import { useMemo } from 'react'
import type { ReactElement } from 'react'

export interface CfAutoCompleteProps {
  value?: string
  onChange?: (value: string) => void
  onFocus?: () => void
  onBlur?: () => void
  disabled?: boolean
  readOnly?: boolean
  placeholder?: string
  dataSource?: DataSourceItem[]
}

export function AutoComplete({ value, onChange, onFocus, onBlur, disabled, readOnly, placeholder, dataSource = [] }: CfAutoCompleteProps): ReactElement {
  const options = useMemo(() => dataSource.map(item => ({ value: String(item.value), label: item.label })), [dataSource])
  
  return (
    <AAutoComplete
      value={value}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
      disabled={disabled || readOnly}
      placeholder={placeholder}
      options={options}
    />
  )
}
