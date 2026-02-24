import type { DataSourceItem } from '@moluoxixi/core'
import type { ReactElement } from 'react'
import { Tag } from 'antd'

type SelectValue = string | number

const EMPTY = '—'

export function PreviewInput({ value }: { value?: string | number }): ReactElement {
  return <span>{value === undefined || value === null || value === '' ? EMPTY : String(value)}</span>
}

export function PreviewPassword({ value }: { value?: string }): ReactElement {
  return <span>{value ? '••••••••' : EMPTY}</span>
}

export function PreviewTextarea({ value }: { value?: string }): ReactElement {
  return <span style={{ whiteSpace: 'pre-wrap' }}>{value || EMPTY}</span>
}

export function PreviewInputNumber({
  value,
  prefix = '',
  suffix = '',
}: {
  value?: string | number
  prefix?: string
  suffix?: string
}): ReactElement {
  if (value === undefined || value === null || value === '') {
    return <span>{EMPTY}</span>
  }
  return (
    <span>
      {prefix}
      {String(value)}
      {suffix}
    </span>
  )
}

export function PreviewSelect({
  value,
  dataSource = [],
}: {
  value?: SelectValue | SelectValue[]
  dataSource?: DataSourceItem[]
}): ReactElement {
  if (value === undefined || value === null || value === '') {
    return <span>{EMPTY}</span>
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span>{EMPTY}</span>
    }
    return (
      <span>
        {value.map((item, index) => {
          const label = dataSource.find(entry => entry.value === item)?.label ?? String(item)
          return (
            <Tag key={`${String(item)}-${index}`}>
              {String(label)}
            </Tag>
          )
        })}
      </span>
    )
  }

  const selectedLabel = dataSource.find(item => item.value === value)?.label
  return <span>{selectedLabel || String(value)}</span>
}

export function PreviewRadioGroup({
  value,
  dataSource = [],
}: {
  value?: SelectValue
  dataSource?: DataSourceItem[]
}): ReactElement {
  const selectedLabel = dataSource.find(item => item.value === value)?.label
  return <span>{selectedLabel || (value === undefined || value === null || value === '' ? EMPTY : String(value))}</span>
}

export function PreviewCheckboxGroup({
  value = [],
  dataSource = [],
}: {
  value?: SelectValue[]
  dataSource?: DataSourceItem[]
}): ReactElement {
  const labels = value
    .map(item => dataSource.find(entry => entry.value === item)?.label ?? String(item))
    .join('、')
  return <span>{labels || EMPTY}</span>
}

export function PreviewSwitch({ value }: { value?: boolean }): ReactElement {
  return <span>{value ? '是' : '否'}</span>
}

export function PreviewDatePicker({ value }: { value?: string }): ReactElement {
  return <span>{value || EMPTY}</span>
}
