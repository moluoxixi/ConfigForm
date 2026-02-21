import type { DataSourceItem } from '@moluoxixi/core'
import type { ReactElement } from 'react'
import { Checkbox as ACheckbox } from 'antd'

export interface CfCheckboxGroupProps {
  value?: unknown[]
  onChange?: (value: unknown[]) => void
  onFocus?: () => void
  onBlur?: () => void
  dataSource?: DataSourceItem[]
  disabled?: boolean
  preview?: boolean
}

/**
 * Checkbox Group：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 Checkbox Group 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
export function CheckboxGroup({ value, onChange, onFocus, onBlur, dataSource = [], disabled, preview }: CfCheckboxGroupProps): ReactElement {
  return (
    <div onFocus={onFocus} onBlur={onBlur}>
      <ACheckbox.Group
        value={value}
        onChange={v => onChange?.(v)}
        disabled={disabled || preview}
        options={dataSource.map(item => ({ label: item.label, value: item.value as string }))}
      />
    </div>
  )
}
