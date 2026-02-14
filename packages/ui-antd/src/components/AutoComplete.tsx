import type { DataSourceItem } from '@moluoxixi/core'
import type { ReactElement } from 'react'
import { AutoComplete as AAutoComplete } from 'antd'
import { useMemo } from 'react'

export interface CfAutoCompleteProps {
  value?: string
  onChange?: (value: string) => void
  onFocus?: () => void
  onBlur?: () => void
  disabled?: boolean
  preview?: boolean
  placeholder?: string
  dataSource?: DataSourceItem[]
}

export function AutoComplete({ value, onChange, onFocus, onBlur, disabled, preview, placeholder, dataSource = [] }: CfAutoCompleteProps): ReactElement {
  const options = useMemo(() => dataSource.map(item => ({ value: String(item.value), label: item.label })), [dataSource])

  return (
    <AAutoComplete
      value={value}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
      disabled={disabled || preview}
      placeholder={placeholder}
      options={options}
    />
  )
}
