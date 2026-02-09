import type { ReactElement } from 'react'
import type { DataSourceItem } from '@moluoxixi/core'
import { Cascader as ACascader } from 'antd'

export interface CfCascaderProps {
  value?: unknown[]
  onChange?: (value: unknown[]) => void
  onFocus?: () => void
  onBlur?: () => void
  dataSource?: DataSourceItem[]
  options?: unknown[]
  placeholder?: string
  disabled?: boolean
  readOnly?: boolean
  loading?: boolean
  showSearch?: boolean
  changeOnSelect?: boolean
}

/**
 * 将 DataSourceItem 转为 antd Cascader 的 options 格式
 */
function toCascaderOptions(items: DataSourceItem[]): unknown[] {
  return items.map(item => ({
    label: item.label,
    value: item.value,
    disabled: item.disabled,
    children: item.children ? toCascaderOptions(item.children) : undefined,
  }))
}

export function Cascader({
  value, onChange, onFocus, onBlur,
  dataSource, options, placeholder, disabled, loading,
  showSearch, changeOnSelect,
}: CfCascaderProps): ReactElement {
  const data = options ?? (dataSource ? toCascaderOptions(dataSource) : [])

  return (
    <ACascader
      value={value}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
      options={data}
      placeholder={placeholder}
      disabled={disabled}
      loading={loading}
      showSearch={showSearch}
      changeOnSelect={changeOnSelect}
      style={{ width: '100%' }}
    />
  )
}
