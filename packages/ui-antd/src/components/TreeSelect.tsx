import type { ReactElement } from 'react'
import type { DataSourceItem } from '@moluoxixi/core'
import { TreeSelect as ATreeSelect } from 'antd'

export interface CfTreeSelectProps {
  value?: unknown
  onChange?: (value: unknown) => void
  onFocus?: () => void
  onBlur?: () => void
  dataSource?: DataSourceItem[]
  treeData?: unknown[]
  placeholder?: string
  disabled?: boolean
  preview?: boolean
  loading?: boolean
  multiple?: boolean
  treeCheckable?: boolean
  showSearch?: boolean
}

/**
 * 将 DataSourceItem 转为 antd TreeSelect 的 treeData 格式
 */
function toTreeData(items: DataSourceItem[]): unknown[] {
  return items.map(item => ({
    title: item.label,
    value: item.value,
    disabled: item.disabled,
    children: item.children ? toTreeData(item.children) : undefined,
  }))
}

export function TreeSelect({
  value, onChange, onFocus, onBlur,
  dataSource, treeData, placeholder, disabled, loading,
  multiple, treeCheckable, showSearch,
}: CfTreeSelectProps): ReactElement {
  const data = treeData ?? (dataSource ? toTreeData(dataSource) : [])

  return (
    <ATreeSelect
      value={value}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
      treeData={data}
      placeholder={placeholder}
      disabled={disabled}
      loading={loading}
      multiple={multiple}
      treeCheckable={treeCheckable}
      showSearch={showSearch}
      style={{ width: '100%' }}
      allowClear
    />
  )
}
