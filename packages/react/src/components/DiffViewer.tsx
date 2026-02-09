import type { DiffFieldView, DiffType } from '@moluoxixi/core'
import type { CSSProperties, ReactElement } from 'react'
import React, { useMemo } from 'react'

/* ======================== 类型定义 ======================== */

export interface DiffViewerProps {
  /** Diff 数据（由 form.getDiffView() 或 diff() 生成） */
  diffs: DiffFieldView[]
  /** 标签映射（路径 → 显示名称） */
  labelMap?: Record<string, string>
  /** 是否只显示有差异的字段 */
  onlyDirty?: boolean
}

/* ======================== 样式常量 ======================== */

const COLORS: Record<DiffType, { bg: string, text: string, border: string }> = {
  added: { bg: '#f6ffed', text: '#52c41a', border: '#b7eb8f' },
  removed: { bg: '#fff2f0', text: '#ff4d4f', border: '#ffccc7' },
  changed: { bg: '#fffbe6', text: '#faad14', border: '#ffe58f' },
  unchanged: { bg: '#fff', text: '#999', border: '#f0f0f0' },
}

const TYPE_LABELS: Record<DiffType, string> = {
  added: '新增',
  removed: '删除',
  changed: '变更',
  unchanged: '未变',
}

/* ======================== 组件 ======================== */

/**
 * DiffViewer — 表单值对比渲染组件
 *
 * 双列对比渲染（左旧右新），差异以颜色高亮显示。
 * 配合 `form.getDiffView()` 或核心层 `diff()` 使用。
 *
 * @example
 * ```tsx
 * import { diff, getDiffView } from '@moluoxixi/core'
 *
 * const diffs = getDiffView(oldValues, newValues)
 * <DiffViewer diffs={diffs} labelMap={{ name: '姓名', age: '年龄' }} />
 * ```
 */
export function DiffViewer({ diffs, labelMap = {}, onlyDirty = true }: DiffViewerProps): ReactElement {
  const filteredDiffs = useMemo(
    () => onlyDirty ? diffs.filter(d => d.dirty) : diffs,
    [diffs, onlyDirty],
  )

  if (filteredDiffs.length === 0) {
    return (
      <div style={emptyStyle}>无差异</div>
    )
  }

  return (
    <div style={containerStyle}>
      {/* 表头 */}
      <div style={headerStyle}>
        <div style={headerCellStyle}>字段</div>
        <div style={headerCellStyle}>旧值</div>
        <div style={headerCellStyle}>新值</div>
        <div style={{ ...headerCellStyle, flex: '0 0 60px' }}>状态</div>
      </div>

      {/* 差异行 */}
      {filteredDiffs.map(entry => {
        const color = COLORS[entry.type]
        const label = labelMap[entry.path] ?? entry.path

        return (
          <div
            key={entry.path}
            style={{
              ...rowStyle,
              background: color.bg,
              borderLeft: `3px solid ${color.border}`,
            }}
          >
            <div style={cellStyle}>{label}</div>
            <div style={cellStyle}>
              {entry.type !== 'added' ? formatValue(entry.oldValue) : '-'}
            </div>
            <div style={cellStyle}>
              {entry.type !== 'removed' ? formatValue(entry.newValue) : '-'}
            </div>
            <div style={{ ...cellStyle, flex: '0 0 60px' }}>
              <span style={{ color: color.text, fontSize: 12, fontWeight: 500 }}>
                {TYPE_LABELS[entry.type]}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ======================== 辅助 ======================== */

function formatValue(value: unknown): string {
  if (value === undefined || value === null) return '-'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

/* ======================== 样式 ======================== */

const containerStyle: CSSProperties = {
  border: '1px solid #e8e8e8',
  borderRadius: 8,
  overflow: 'hidden',
  fontSize: 14,
}

const headerStyle: CSSProperties = {
  display: 'flex',
  background: '#fafafa',
  borderBottom: '1px solid #e8e8e8',
  fontWeight: 600,
  color: '#333',
}

const headerCellStyle: CSSProperties = {
  flex: 1,
  padding: '10px 12px',
}

const rowStyle: CSSProperties = {
  display: 'flex',
  borderBottom: '1px solid #f0f0f0',
}

const cellStyle: CSSProperties = {
  flex: 1,
  padding: '8px 12px',
  wordBreak: 'break-all',
}

const emptyStyle: CSSProperties = {
  padding: 24,
  textAlign: 'center',
  color: '#999',
  background: '#fafafa',
  borderRadius: 8,
  border: '1px dashed #d9d9d9',
}
