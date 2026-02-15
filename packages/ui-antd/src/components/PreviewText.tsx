/**
 * 阅读态纯文本展示组件集（readPretty）
 *
 * 参考 Formily PreviewText 设计，每个组件对应一个编辑组件的阅读态替代。
 * 由 FormField 在 isPreview 时自动替换渲染，UI 组件无需关心预览态。
 */
import { Tag } from 'antd'
import React from 'react'

/** 空值占位符 */
const EMPTY = '—'

interface DataSourceItem { label: string, value: string | number }

/** 文本输入阅读态 */
export function PreviewInput({ value }: { value?: string | number }): React.ReactElement {
  return <span>{value ? String(value) : EMPTY}</span>
}

/** 密码阅读态 */
export function PreviewPassword({ value }: { value?: string }): React.ReactElement {
  return <span>{value ? '••••••••' : EMPTY}</span>
}

/** 多行文本阅读态 */
export function PreviewTextarea({ value }: { value?: string }): React.ReactElement {
  return <span style={{ whiteSpace: 'pre-wrap' }}>{value || EMPTY}</span>
}

/** 数字输入阅读态 */
export function PreviewInputNumber({ value }: { value?: string | number }): React.ReactElement {
  return <span>{value != null ? String(value) : EMPTY}</span>
}

/** 下拉选择阅读态 */
export function PreviewSelect({ value, dataSource = [] }: { value?: string | number | (string | number)[], dataSource?: DataSourceItem[] }): React.ReactElement {
  if (value == null || value === '')
    return <span>{EMPTY}</span>
  if (Array.isArray(value)) {
    if (value.length === 0)
      return <span>{EMPTY}</span>
    return (
      <span>
        {value.map((v, i) => {
          const label = dataSource.find(item => item.value === v)?.label ?? String(v)
          return <Tag key={i}>{label}</Tag>
        })}
      </span>
    )
  }
  const selectedLabel = dataSource.find(item => item.value === value)?.label
  return <span>{selectedLabel || (value ? String(value) : EMPTY)}</span>
}

/** 单选组阅读态 */
export function PreviewRadioGroup({ value, dataSource = [] }: { value?: string | number, dataSource?: DataSourceItem[] }): React.ReactElement {
  const selectedLabel = dataSource.find(item => item.value === value)?.label
  return <span>{selectedLabel || (value ? String(value) : EMPTY)}</span>
}

/** 多选组阅读态 */
export function PreviewCheckboxGroup({ value = [], dataSource = [] }: { value?: unknown[], dataSource?: DataSourceItem[] }): React.ReactElement {
  const labels = value.map(v => dataSource.find(item => item.value === v)?.label ?? String(v)).join('、')
  return <span>{labels || EMPTY}</span>
}

/** 开关阅读态 */
export function PreviewSwitch({ value }: { value?: boolean }): React.ReactElement {
  return <span>{value ? '是' : '否'}</span>
}

/** 日期选择阅读态 */
export function PreviewDatePicker({ value }: { value?: string }): React.ReactElement {
  return <span>{value || EMPTY}</span>
}
