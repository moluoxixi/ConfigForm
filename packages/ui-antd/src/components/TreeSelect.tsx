import type { DataSourceItem } from '@moluoxixi/core'
import type { ReactElement } from 'react'
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

/**
 * Tree Select：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 Tree Select 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
export function TreeSelect({
  value,
  onChange,
  onFocus,
  onBlur,
  dataSource,
  treeData,
  placeholder,
  disabled,
  loading,
  multiple,
  treeCheckable,
  showSearch,
}: CfTreeSelectProps): ReactElement {
  const data = treeData ?? (dataSource ? toTreeData(dataSource) : [])

  return (
    <ATreeSelect
      value={value as any}
      onChange={nextValue => onChange?.(nextValue)}
      onFocus={onFocus}
      onBlur={onBlur}
      treeData={data as any}
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
