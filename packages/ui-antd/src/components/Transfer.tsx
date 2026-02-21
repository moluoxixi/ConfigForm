import type { DataSourceItem } from '@moluoxixi/core'
import type { ReactElement } from 'react'
import { Transfer as ATransfer } from 'antd'

export interface CfTransferProps {
  value?: string[]
  onChange?: (value: string[]) => void
  dataSource?: DataSourceItem[]
  disabled?: boolean
  preview?: boolean
  showSearch?: boolean
  titles?: [string, string]
}

/**
 * Transfer：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 Transfer 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
export function Transfer({
  value = [],
  onChange,
  dataSource = [],
  disabled,
  showSearch,
  titles,
}: CfTransferProps): ReactElement {
  const transferData = dataSource.map(item => ({
    key: String(item.value),
    title: item.label,
    disabled: item.disabled,
  }))

  return (
    <ATransfer
      dataSource={transferData}
      targetKeys={value}
      onChange={targetKeys => onChange?.(targetKeys.map(key => String(key)))}
      disabled={disabled}
      showSearch={showSearch}
      titles={titles}
      render={item => item.title ?? ''}
      listStyle={{ width: 220, height: 300 }}
    />
  )
}
