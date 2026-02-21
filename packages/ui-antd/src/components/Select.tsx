import type { DataSourceItem } from '@moluoxixi/core'
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
  preview?: boolean
  loading?: boolean
  mode?: 'multiple' | 'tags'
}

/**
 * Select：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 Select 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
export function Select({ value, onChange, onFocus, onBlur, dataSource = [], placeholder, disabled, preview, loading, mode }: CfSelectProps): React.ReactElement {
  return (
    <ASelect
      value={value}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
      placeholder={placeholder}
      disabled={disabled || preview}
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
