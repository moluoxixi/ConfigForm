import type { ReactElement } from 'react'
import type { DataSourceItem } from '@moluoxixi/core'
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

export function Transfer({
  value = [], onChange, dataSource = [], disabled, showSearch, titles,
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
      onChange={(targetKeys) => onChange?.(targetKeys)}
      disabled={disabled}
      showSearch={showSearch}
      titles={titles}
      render={item => item.title ?? ''}
      listStyle={{ width: 220, height: 300 }}
    />
  )
}
