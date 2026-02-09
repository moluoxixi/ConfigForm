import type { DataSourceItem } from '@moluoxixi/core'
import { Mentions as AMentions } from 'antd'
import { useMemo } from 'react'
import type { ReactElement } from 'react'

export interface CfMentionsProps {
  value?: string
  onChange?: (value: string) => void
  onFocus?: () => void
  onBlur?: () => void
  disabled?: boolean
  preview?: boolean
  placeholder?: string
  dataSource?: DataSourceItem[]
  prefix?: string
}

export function Mentions({ value, onChange, onFocus, onBlur, disabled, preview, placeholder, dataSource = [], prefix = '@' }: CfMentionsProps): ReactElement {
  const options = useMemo(() => dataSource.map(item => ({ value: String(item.value), label: item.label })), [dataSource])
  
  return (
    <AMentions
      value={value}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
      disabled={disabled || preview}
      placeholder={placeholder}
      options={options}
      prefix={prefix}
    />
  )
}
