import type { DiffFieldView, DiffType } from '@moluoxixi/core'
import type { CSSProperties, ReactElement } from 'react'
import { useMemo } from 'react'

/**
 * DiffViewer 组件属性。
 */
export interface DiffViewerProps {
  /** 差异条目列表，可由 `form.getDiffView()` 或 `diff()` 产出。 */
  diffs: DiffFieldView[]
  /** 字段标签映射，键为字段路径，值为界面展示名称。 */
  labelMap?: Record<string, string>
  /** 是否仅展示 dirty 条目，默认仅展示变化项。 */
  onlyDirty?: boolean
}

/**
 * 差异类型对应的视觉样式配置。
 * 不同类型采用不同背景色和边框色，方便用户快速识别变化性质。
 */
const COLORS: Record<DiffType, { bg: string, text: string, border: string }> = {
  added: { bg: '#f6ffed', text: '#52c41a', border: '#b7eb8f' },
  removed: { bg: '#fff2f0', text: '#ff4d4f', border: '#ffccc7' },
  changed: { bg: '#fffbe6', text: '#faad14', border: '#ffe58f' },
  unchanged: { bg: '#fff', text: '#999', border: '#f0f0f0' },
}

/**
 * 差异类型标签映射。
 */
const TYPE_LABELS: Record<DiffType, string> = {
  added: '新增',
  removed: '删除',
  changed: '变更',
  unchanged: '未变',
}

/** 外层容器样式。 */
const containerStyle: CSSProperties = {
  border: '1px solid #e8e8e8',
  borderRadius: 8,
  overflow: 'hidden',
  fontSize: 14,
}

/** 表头行样式。 */
const headerStyle: CSSProperties = {
  display: 'flex',
  background: '#fafafa',
  borderBottom: '1px solid #e8e8e8',
  fontWeight: 600,
  color: '#333',
}

/** 表头单元格样式。 */
const headerCellStyle: CSSProperties = {
  flex: 1,
  padding: '10px 12px',
}

/** 数据行样式。 */
const rowStyle: CSSProperties = {
  display: 'flex',
  borderBottom: '1px solid #f0f0f0',
}

/** 普通数据单元格样式。 */
const cellStyle: CSSProperties = {
  flex: 1,
  padding: '8px 12px',
  wordBreak: 'break-all',
}

/** 空数据占位样式。 */
const emptyStyle: CSSProperties = {
  padding: 24,
  textAlign: 'center',
  color: '#999',
  background: '#fafafa',
  borderRadius: 8,
  border: '1px dashed #d9d9d9',
}

/**
 * 差异对比展示组件。
 *
 * 以“字段 / 旧值 / 新值 / 状态”四列展示差异数据，
 * 支持按 `onlyDirty` 过滤仅保留有变化的字段。
 *
 * @param props 组件属性对象。
 * @param props.diffs 差异条目数组。
 * @param props.labelMap 字段路径到显示名称的映射表。
 * @param props.onlyDirty 是否仅展示变化项。
 * @returns 返回差异表格或空状态提示。
 */
export function DiffViewer(props: DiffViewerProps): ReactElement {
  const { diffs, labelMap = {}, onlyDirty = true } = props
  const filteredDiffs = useMemo(
    () => (onlyDirty ? diffs.filter(entry => entry.dirty) : diffs),
    [diffs, onlyDirty],
  )

  if (filteredDiffs.length === 0) {
    return <div style={emptyStyle}>无差异</div>
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div style={headerCellStyle}>字段</div>
        <div style={headerCellStyle}>旧值</div>
        <div style={headerCellStyle}>新值</div>
        <div style={{ ...headerCellStyle, flex: '0 0 60px' }}>状态</div>
      </div>
      {filteredDiffs.map((entry) => {
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

/**
 * 把任意值格式化为可展示文本。
 *
 * @param value 待格式化值。
 * @returns 返回用于界面渲染的文本。
 */
function formatValue(value: unknown): string {
  if (value === undefined || value === null) {
    return '-'
  }
  if (typeof value === 'object') {
    return JSON.stringify(value)
  }
  return String(value)
}
