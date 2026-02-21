import type { DataSourceItem } from '@moluoxixi/core'
import type { ReactElement } from 'react'
import { Radio as ARadio } from 'antd'

export interface CfRadioGroupProps {
  value?: unknown
  onChange?: (value: unknown) => void
  onFocus?: () => void
  onBlur?: () => void
  dataSource?: DataSourceItem[]
  disabled?: boolean
  preview?: boolean
}

/**
 * Radio Group：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 Radio Group 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
export function RadioGroup({ value, onChange, onFocus, onBlur, dataSource = [], disabled, preview }: CfRadioGroupProps): ReactElement {
  return (
    <div onFocus={onFocus} onBlur={onBlur}>
      <ARadio.Group
        value={value}
        onChange={e => onChange?.(e.target.value)}
        disabled={disabled || preview}
        options={dataSource.map(item => ({ label: item.label, value: item.value }))}
      />
    </div>
  )
}
