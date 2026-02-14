import type { DataSourceItem } from '@moluoxixi/core'
import type { DefaultOptionType } from 'antd/es/cascader'
import type { ReactElement } from 'react'
import { Cascader as ACascader } from 'antd'

type CascaderValue = Array<string | number | null>

export interface CfCascaderProps {
  value?: unknown[]
  onChange?: (value: unknown[]) => void
  onFocus?: () => void
  onBlur?: () => void
  dataSource?: DataSourceItem[]
  options?: DefaultOptionType[]
  placeholder?: string
  disabled?: boolean
  preview?: boolean
  loading?: boolean
  showSearch?: boolean
  changeOnSelect?: boolean
}

/**
 * 将 DataSourceItem 转为 antd Cascader 的 options 格式
 */
function toCascaderOptions(items: DataSourceItem[]): DefaultOptionType[] {
  return items.map(item => ({
    label: item.label,
    value: item.value as string | number | null,
    disabled: item.disabled,
    children: item.children ? toCascaderOptions(item.children) : undefined,
  }))
}

export function Cascader({
  value,
  onChange,
  onFocus,
  onBlur,
  dataSource,
  options,
  placeholder,
  disabled,
  loading,
  showSearch,
  changeOnSelect,
}: CfCascaderProps): ReactElement {
  const data = options ?? (dataSource ? toCascaderOptions(dataSource) : [])

  return (
    <ACascader
      value={value as CascaderValue | undefined}
      onChange={(nextValue) => {
        onChange?.(nextValue as unknown[])
      }}
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
