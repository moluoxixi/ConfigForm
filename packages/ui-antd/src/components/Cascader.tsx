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

/**
 * Cascader：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 Cascader 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
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
