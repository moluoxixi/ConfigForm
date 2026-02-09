/**
 * DevTools 浮动面板（React 版）
 *
 * 纯数据 props 驱动，不依赖 form 实例。
 * 可直接复用于 Chrome Extension（数据来源改为 postMessage 即可）。
 */
import type { DevToolsPluginAPI, EventLogEntry, FieldDetail, FieldTreeNode, FormOverview, ValueDiffEntry } from '@moluoxixi/plugin-devtools'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

/* ======================== 主题 ======================== */

interface Theme {
  bg: string; bgPanel: string; bgHover: string; bgActive: string; border: string
  text: string; textSecondary: string; textDim: string
  accent: string; green: string; red: string; yellow: string; purple: string
  shadow: string; badgeBg: string; inputBg: string
}

const lightTheme: Theme = {
  bg: '#ffffff', bgPanel: '#f7f8fa', bgHover: '#f0f2f5', bgActive: '#e8f4ff',
  border: '#e5e7eb', text: '#1f2937', textSecondary: '#6b7280', textDim: '#9ca3af',
  accent: '#3b82f6', green: '#10b981', red: '#ef4444', yellow: '#f59e0b', purple: '#8b5cf6',
  shadow: '0 8px 30px rgba(0,0,0,0.12)', badgeBg: '#f3f4f6', inputBg: '#f9fafb',
}

const darkTheme: Theme = {
  bg: '#1a1b2e', bgPanel: '#222338', bgHover: '#2a2b45', bgActive: '#1e3a5f',
  border: '#333456', text: '#e2e8f0', textSecondary: '#94a3b8', textDim: '#64748b',
  accent: '#60a5fa', green: '#34d399', red: '#f87171', yellow: '#fbbf24', purple: '#a78bfa',
  shadow: '0 8px 30px rgba(0,0,0,0.4)', badgeBg: '#2a2b45', inputBg: '#1e1f35',
}

function useSystemTheme(): Theme {
  const [isDark, setIsDark] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches,
  )
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const h = (e: MediaQueryListEvent): void => setIsDark(e.matches)
    mq.addEventListener('change', h)
    return () => mq.removeEventListener('change', h)
  }, [])
  return isDark ? darkTheme : lightTheme
}

/* ======================== 常量 ======================== */

const PANEL_W = 720
const PANEL_H = 520
const TREE_W = 230

const TYPE_CFG: Record<string, { ch: string, c: string, bg: string }> = {
  field: { ch: 'F', c: '#3b82f6', bg: '#3b82f620' },
  arrayField: { ch: 'A', c: '#10b981', bg: '#10b98120' },
  objectField: { ch: 'O', c: '#8b5cf6', bg: '#8b5cf620' },
  voidField: { ch: 'V', c: '#f59e0b', bg: '#f59e0b20' },
}

type Tab = 'tree' | 'events' | 'diff' | 'values'

/* ======================== 主面板 ======================== */

export interface DevToolsPanelProps { api: DevToolsPluginAPI }

export function DevToolsPanel({ api }: DevToolsPanelProps): React.ReactElement {
  const t = useSystemTheme()
  const [visible, setVisible] = useState(false)
  const [tab, setTab] = useState<Tab>('tree')
  const [selected, setSelected] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'error' | 'required' | 'modified'>('all')
  const [, setTick] = useState(0)

  useEffect(() => api.subscribe(() => setTick(n => n + 1)), [api])

  const tree = useMemo(() => api.getFieldTree(), [api, visible, tab])
  const overview = useMemo(() => api.getFormOverview(), [api, visible])
  const events = useMemo(() => api.getEventLog(), [api, visible, tab])
  const detail = useMemo(() => selected ? api.getFieldDetail(selected) : null, [api, selected])
  const diff = useMemo(() => api.getValueDiff(), [api, visible, tab])

  /** 过滤字段树 */
  const filteredTree = useMemo(() => {
    if (!search && filter === 'all') return tree
    return filterTree(tree, search, filter, diff)
  }, [tree, search, filter, diff])

  if (!visible) {
    return (
      <button onClick={() => setVisible(true)} title="ConfigForm DevTools"
        style={{
          position: 'fixed', bottom: 20, right: 20, zIndex: 99999,
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 14px', borderRadius: 20,
          background: t.accent, color: '#fff', border: 'none',
          cursor: 'pointer', fontSize: 13, fontWeight: 600,
          boxShadow: '0 2px 12px rgba(59,130,246,0.4)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}>
        <span style={{ fontSize: 15 }}>⚙</span> DevTools
        {overview.errorFieldCount > 0 && (
          <span style={{ background: '#ef4444', borderRadius: 8, padding: '1px 6px', fontSize: 11, fontWeight: 700 }}>
            {overview.errorFieldCount}
          </span>
        )}
      </button>
    )
  }

  return (
    <div style={{
      position: 'fixed', bottom: 20, right: 20, zIndex: 99999,
      width: PANEL_W, height: PANEL_H,
      background: t.bg, color: t.text,
      borderRadius: 12, border: `1px solid ${t.border}`,
      boxShadow: t.shadow,
      display: 'flex', flexDirection: 'column',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: 13, overflow: 'hidden',
    }}>
      {/* 标题栏 */}
      <Header t={t} overview={overview} onClose={() => setVisible(false)}
        onValidate={() => api.validateAll()} onReset={() => api.resetForm()}
        onSubmit={() => api.submitForm()} />

      {/* Tab + 搜索 */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${t.border}`, background: t.bgPanel, flexShrink: 0 }}>
        {(['tree', 'events', 'diff', 'values'] as Tab[]).map(tb => (
          <TabBtn key={tb} t={t} active={tab === tb}
            onClick={() => { setTab(tb); setSelected(null) }}
            label={{ tree: '字段', events: '事件', diff: 'Diff', values: '数据' }[tb]}
            count={tb === 'events' ? events.length : tb === 'diff' ? diff.filter(d => d.changed).length : undefined} />
        ))}
        {tab === 'tree' && (
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="搜索字段..." style={{
              flex: 1, border: 'none', outline: 'none', padding: '0 10px',
              background: 'transparent', color: t.text, fontSize: 12,
              fontFamily: 'inherit',
            }} />
        )}
      </div>

      {/* 过滤栏（仅字段 Tab） */}
      {tab === 'tree' && (
        <div style={{ display: 'flex', gap: 4, padding: '4px 8px', borderBottom: `1px solid ${t.border}`, background: t.bgPanel }}>
          {(['all', 'error', 'required', 'modified'] as const).map(f => (
            <FilterPill key={f} t={t} active={filter === f} onClick={() => setFilter(f)}
              label={{ all: '全部', error: '错误', required: '必填', modified: '已修改' }[f]} />
          ))}
        </div>
      )}

      {/* 内容区 */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
        {tab === 'tree' && (
          <>
            <div style={{ width: TREE_W, flexShrink: 0, overflow: 'auto', borderRight: `1px solid ${t.border}` }}>
              <TreeView t={t} nodes={filteredTree} selected={selected}
                onSelect={p => { setSelected(p); api.highlightField(p) }} />
            </div>
            <div style={{ flex: 1, overflow: 'auto' }}>
              {detail
                ? <DetailView t={t} detail={detail} api={api} />
                : <Empty t={t} text="点击字段查看详情" />}
            </div>
          </>
        )}
        {tab === 'events' && <EventsView t={t} events={events} onClear={() => api.clearEventLog()} />}
        {tab === 'diff' && <DiffView t={t} diff={diff} />}
        {tab === 'values' && <ValuesView t={t} values={overview.values} />}
      </div>
    </div>
  )
}

/* ======================== 标题栏 ======================== */

function Header({ t, overview, onClose, onValidate, onReset, onSubmit }: {
  t: Theme, overview: FormOverview, onClose: () => void
  onValidate: () => void, onReset: () => void, onSubmit: () => void
}): React.ReactElement {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '8px 12px', borderBottom: `1px solid ${t.border}`,
      background: t.bgPanel, flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: t.accent }}>⚙ DevTools</span>
        <Badge t={t} label={`${overview.fieldCount} 字段`} color={t.accent} />
        {overview.errorFieldCount > 0 && <Badge t={t} label={`${overview.errorFieldCount} 错误`} color={t.red} />}
        <Badge t={t} label={overview.pattern} color={t.textDim} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <ActionBtn t={t} label="验证" onClick={onValidate} />
        <ActionBtn t={t} label="重置" onClick={onReset} />
        <ActionBtn t={t} label="提交" onClick={onSubmit} color={t.accent} />
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: t.textDim, cursor: 'pointer', fontSize: 18, padding: '0 4px' }}>×</button>
      </div>
    </div>
  )
}

function ActionBtn({ t, label, onClick, color }: { t: Theme, label: string, onClick: () => void, color?: string }): React.ReactElement {
  return (
    <button onClick={onClick} style={{
      background: 'none', border: `1px solid ${t.border}`, color: color ?? t.textSecondary,
      cursor: 'pointer', borderRadius: 4, padding: '2px 8px', fontSize: 11, fontFamily: 'inherit', fontWeight: 500,
    }}>{label}</button>
  )
}

/* ======================== 基础组件 ======================== */

function Badge({ t, label, color }: { t: Theme, label: string, color: string }): React.ReactElement {
  return <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 10, background: t.badgeBg, color }}>{label}</span>
}

function TabBtn({ t, active, onClick, label, count }: { t: Theme, active: boolean, onClick: () => void, label: string, count?: number }): React.ReactElement {
  return (
    <button onClick={onClick} style={{
      padding: '8px 14px', border: 'none', cursor: 'pointer',
      background: active ? t.bg : 'transparent', color: active ? t.accent : t.textSecondary,
      fontWeight: active ? 700 : 500, fontSize: 13, fontFamily: 'inherit',
      borderBottom: active ? `2px solid ${t.accent}` : '2px solid transparent',
      display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0,
    }}>
      {label}
      {count !== undefined && count > 0 && (
        <span style={{ fontSize: 10, background: t.badgeBg, color: t.textDim, padding: '1px 5px', borderRadius: 8 }}>{count}</span>
      )}
    </button>
  )
}

function FilterPill({ t, active, onClick, label }: { t: Theme, active: boolean, onClick: () => void, label: string }): React.ReactElement {
  return (
    <button onClick={onClick} style={{
      padding: '2px 10px', border: `1px solid ${active ? t.accent : t.border}`, borderRadius: 12,
      background: active ? t.bgActive : 'transparent', color: active ? t.accent : t.textDim,
      cursor: 'pointer', fontSize: 11, fontFamily: 'inherit', fontWeight: active ? 600 : 400,
    }}>{label}</button>
  )
}

function Empty({ t, text }: { t: Theme, text: string }): React.ReactElement {
  return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: t.textDim }}>{text}</div>
}

/* ======================== 字段树 ======================== */

function TreeView({ t, nodes, selected, onSelect, depth = 0 }: {
  t: Theme, nodes: FieldTreeNode[], selected: string | null, onSelect: (p: string) => void, depth?: number
}): React.ReactElement {
  return (
    <div>
      {nodes.map(n => (
        <div key={n.path}>
          <div onClick={() => onSelect(n.path)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '5px 8px', paddingLeft: 8 + depth * 14, cursor: 'pointer',
              background: selected === n.path ? t.bgActive : 'transparent',
              borderLeft: selected === n.path ? `3px solid ${t.accent}` : '3px solid transparent',
            }}
            onMouseEnter={e => { if (selected !== n.path) e.currentTarget.style.background = t.bgHover }}
            onMouseLeave={e => { if (selected !== n.path) e.currentTarget.style.background = 'transparent' }}>
            <TypeBadge type={n.type} />
            <span style={{ flex: 1, fontSize: 12, fontWeight: selected === n.path ? 600 : 400, color: n.visible ? t.text : t.textDim, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {n.label || n.name}
            </span>
            {n.errorCount > 0 && <Dot color="#ef4444" />}
            {n.required && <span style={{ color: t.yellow, fontSize: 11, fontWeight: 700 }}>*</span>}
          </div>
          {n.children.length > 0 && <TreeView t={t} nodes={n.children} selected={selected} onSelect={onSelect} depth={depth + 1} />}
        </div>
      ))}
      {nodes.length === 0 && depth === 0 && <Empty t={t} text="无匹配字段" />}
    </div>
  )
}

function TypeBadge({ type }: { type: string }): React.ReactElement {
  const c = TYPE_CFG[type] ?? TYPE_CFG.field
  return <span style={{ fontSize: 9, fontWeight: 800, width: 16, height: 16, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4, background: c.bg, color: c.c, flexShrink: 0 }}>{c.ch}</span>
}

function Dot({ color }: { color: string }): React.ReactElement {
  return <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />
}

/* ======================== 字段详情（含编辑能力） ======================== */

function DetailView({ t, detail, api }: { t: Theme, detail: FieldDetail, api: DevToolsPluginAPI }): React.ReactElement {
  const [editValue, setEditValue] = useState('')
  const [editing, setEditing] = useState(false)

  const startEdit = useCallback(() => {
    setEditValue(JSON.stringify(detail.value) ?? '')
    setEditing(true)
  }, [detail.value])

  const applyEdit = useCallback(() => {
    try {
      const parsed = JSON.parse(editValue)
      api.setFieldValue(detail.path, parsed)
    } catch {
      api.setFieldValue(detail.path, editValue)
    }
    setEditing(false)
  }, [api, detail.path, editValue])

  return (
    <div style={{ padding: 14 }}>
      {/* 标题 */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <TypeBadge type={detail.type} />
          <span style={{ fontSize: 15, fontWeight: 700 }}>{detail.label || detail.name}</span>
          <button onClick={() => api.highlightField(detail.path)} title="在页面中定位"
            style={{ background: 'none', border: `1px solid ${t.border}`, color: t.accent, cursor: 'pointer', borderRadius: 4, padding: '1px 6px', fontSize: 10, fontFamily: 'inherit' }}>
            定位
          </button>
        </div>
        <span style={{ fontSize: 12, color: t.textDim, fontFamily: 'monospace' }}>{detail.path}</span>
      </div>

      {/* 组件 */}
      <Sec t={t} title="组件">
        <Row t={t} label="component" value={detail.component} mono />
        <Row t={t} label="decorator" value={detail.decorator || '—'} mono />
      </Sec>

      {/* 状态（可编辑） */}
      <Sec t={t} title="状态">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 4 }}>
          <TogglePill t={t} label="visible" value={detail.visible}
            onClick={() => api.setFieldState(detail.path, { visible: !detail.visible })} />
          <TogglePill t={t} label="disabled" value={detail.disabled}
            onClick={() => api.setFieldState(detail.path, { disabled: !detail.disabled })} />
          <TogglePill t={t} label="preview" value={detail.preview}
            onClick={() => api.setFieldState(detail.path, { preview: !detail.preview })} />
          <StatePill t={t} label="pattern" value={detail.pattern} color={t.accent} />
          <StatePill t={t} label="required" value={detail.required} color={t.red} />
        </div>
      </Sec>

      {/* 值（可编辑） */}
      <Sec t={t} title="数据">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <span style={{ fontSize: 12, color: t.textSecondary, width: 50 }}>value</span>
          {editing
            ? (
                <div style={{ flex: 1, display: 'flex', gap: 4 }}>
                  <input value={editValue} onChange={e => setEditValue(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && applyEdit()}
                    style={{ flex: 1, padding: '3px 8px', border: `1px solid ${t.accent}`, borderRadius: 4, background: t.inputBg, color: t.text, fontSize: 12, fontFamily: 'monospace', outline: 'none' }} />
                  <button onClick={applyEdit} style={{ background: t.accent, color: '#fff', border: 'none', borderRadius: 4, padding: '3px 8px', cursor: 'pointer', fontSize: 11, fontFamily: 'inherit' }}>确定</button>
                  <button onClick={() => setEditing(false)} style={{ background: 'none', border: `1px solid ${t.border}`, color: t.textDim, borderRadius: 4, padding: '3px 8px', cursor: 'pointer', fontSize: 11, fontFamily: 'inherit' }}>取消</button>
                </div>
              )
            : (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontFamily: 'monospace', fontSize: 12, color: t.green }}>{JSON.stringify(detail.value)}</span>
                  {detail.type !== 'voidField' && (
                    <button onClick={startEdit} style={{ background: 'none', border: `1px solid ${t.border}`, color: t.textDim, cursor: 'pointer', borderRadius: 4, padding: '1px 6px', fontSize: 10, fontFamily: 'inherit' }}>编辑</button>
                  )}
                </div>
              )}
        </div>
        <Row t={t} label="initial" value={JSON.stringify(detail.initialValue) ?? '—'} mono />
      </Sec>

      {/* 错误 */}
      {detail.errors.length > 0 && (
        <Sec t={t} title={`错误 (${detail.errors.length})`}>
          {detail.errors.map((e, i) => <div key={i} style={{ color: t.red, fontSize: 12, padding: '2px 0' }}>• {e.message}</div>)}
        </Sec>
      )}
      {detail.warnings.length > 0 && (
        <Sec t={t} title={`警告 (${detail.warnings.length})`}>
          {detail.warnings.map((e, i) => <div key={i} style={{ color: t.yellow, fontSize: 12, padding: '2px 0' }}>• {e.message}</div>)}
        </Sec>
      )}
    </div>
  )
}

function Sec({ t, title, children }: { t: Theme, title: string, children: React.ReactNode }): React.ReactElement {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: t.textDim, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</div>
      {children}
    </div>
  )
}

function Row({ t, label, value, mono }: { t: Theme, label: string, value: string, mono?: boolean }): React.ReactElement {
  return (
    <div style={{ display: 'flex', gap: 8, padding: '2px 0', fontSize: 12 }}>
      <span style={{ width: 50, flexShrink: 0, color: t.textSecondary }}>{label}</span>
      <span style={{ color: t.text, wordBreak: 'break-all', fontFamily: mono ? 'ui-monospace, monospace' : 'inherit', fontSize: mono ? 11 : 12 }}>{value}</span>
    </div>
  )
}

function StatePill({ t, label, value, color }: { t: Theme, label: string, value: string | boolean, color: string }): React.ReactElement {
  const display = typeof value === 'boolean' ? (value ? 'true' : 'false') : value
  return <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: t.badgeBg, color: value === false || value === 'false' ? t.textDim : color }}>{label}: {display}</span>
}

/** 可点击切换的状态药丸 */
function TogglePill({ t, label, value, onClick }: { t: Theme, label: string, value: boolean, onClick: () => void }): React.ReactElement {
  return (
    <button onClick={onClick} title={`点击切换 ${label}`} style={{
      fontSize: 11, padding: '2px 8px', borderRadius: 6, cursor: 'pointer',
      border: `1px solid ${value ? t.accent : t.border}`,
      background: value ? t.bgActive : t.badgeBg,
      color: value ? t.accent : t.textDim,
      fontWeight: value ? 600 : 400, fontFamily: 'inherit',
    }}>
      {label}: {value ? 'true' : 'false'}
    </button>
  )
}

/* ======================== 事件视图 ======================== */

function EventsView({ t, events, onClear }: { t: Theme, events: EventLogEntry[], onClear: () => void }): React.ReactElement {
  const reversed = useMemo(() => [...events].reverse(), [events])
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 12px', borderBottom: `1px solid ${t.border}`, background: t.bgPanel, flexShrink: 0 }}>
        <span style={{ color: t.textDim, fontSize: 12 }}>{events.length} 条事件</span>
        <button onClick={onClear} style={{ background: 'none', border: `1px solid ${t.border}`, color: t.textSecondary, cursor: 'pointer', borderRadius: 4, padding: '2px 10px', fontSize: 11, fontFamily: 'inherit' }}>清空</button>
      </div>
      <div style={{ flex: 1, overflow: 'auto' }}>
        {reversed.map(ev => (
          <div key={ev.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '4px 12px', borderBottom: `1px solid ${t.border}10`, fontSize: 12 }}>
            <span style={{ color: t.textDim, flexShrink: 0, fontSize: 11, fontFamily: 'monospace' }}>
              {new Date(ev.timestamp).toLocaleTimeString('zh-CN', { hour12: false })}
            </span>
            {ev.fieldPath && <span style={{ fontSize: 10, padding: '1px 5px', borderRadius: 3, background: t.badgeBg, color: t.accent, fontFamily: 'monospace', flexShrink: 0 }}>{ev.fieldPath}</span>}
            <span style={{ color: ev.type.includes('FAILED') ? t.red : ev.type.includes('SUCCESS') ? t.green : ev.type.includes('devtools:') ? t.purple : t.text, flex: 1 }}>
              {ev.summary}
            </span>
          </div>
        ))}
        {events.length === 0 && <Empty t={t} text="暂无事件" />}
      </div>
    </div>
  )
}

/* ======================== Diff 视图 ======================== */

function DiffView({ t, diff }: { t: Theme, diff: ValueDiffEntry[] }): React.ReactElement {
  const changed = useMemo(() => diff.filter(d => d.changed), [diff])
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      <div style={{ padding: '6px 12px', borderBottom: `1px solid ${t.border}`, background: t.bgPanel, flexShrink: 0 }}>
        <span style={{ color: t.textDim, fontSize: 12 }}>{changed.length} / {diff.length} 个字段已修改</span>
      </div>
      <div style={{ flex: 1, overflow: 'auto' }}>
        {diff.map(d => (
          <div key={d.path} style={{
            display: 'flex', alignItems: 'flex-start', gap: 8, padding: '5px 12px',
            borderBottom: `1px solid ${t.border}15`,
            background: d.changed ? `${t.yellow}08` : 'transparent',
          }}>
            <span style={{ width: 120, flexShrink: 0, fontSize: 12, fontWeight: d.changed ? 600 : 400, color: d.changed ? t.text : t.textDim }}>
              {d.label || d.path}
            </span>
            <span style={{ fontSize: 11, fontFamily: 'monospace', color: t.red, textDecoration: d.changed ? 'line-through' : 'none', opacity: d.changed ? 0.6 : 0.3, flexShrink: 0, minWidth: 60 }}>
              {JSON.stringify(d.initialValue)}
            </span>
            {d.changed && <span style={{ color: t.textDim }}>→</span>}
            {d.changed && (
              <span style={{ fontSize: 11, fontFamily: 'monospace', color: t.green, fontWeight: 600 }}>
                {JSON.stringify(d.currentValue)}
              </span>
            )}
          </div>
        ))}
        {diff.length === 0 && <Empty t={t} text="暂无字段" />}
      </div>
    </div>
  )
}

/* ======================== 值视图 ======================== */

function ValuesView({ t, values }: { t: Theme, values: Record<string, unknown> }): React.ReactElement {
  const json = useMemo(() => JSON.stringify(values, null, 2), [values])
  const [copied, setCopied] = useState(false)
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(json).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500) }).catch(() => {})
  }, [json])
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '6px 12px', borderBottom: `1px solid ${t.border}`, background: t.bgPanel, flexShrink: 0 }}>
        <button onClick={handleCopy} style={{
          background: copied ? t.green : 'none', border: `1px solid ${copied ? t.green : t.border}`,
          color: copied ? '#fff' : t.textSecondary, cursor: 'pointer', borderRadius: 4, padding: '2px 12px', fontSize: 11, fontFamily: 'inherit', transition: 'all 0.2s',
        }}>{copied ? '已复制 ✓' : '复制 JSON'}</button>
      </div>
      <pre style={{ flex: 1, margin: 0, padding: 12, overflow: 'auto', fontSize: 12, lineHeight: 1.7, fontFamily: 'ui-monospace, monospace', color: t.green, background: t.bg }}>{json}</pre>
    </div>
  )
}

/* ======================== 工具 ======================== */

/** 过滤字段树 */
function filterTree(nodes: FieldTreeNode[], search: string, filter: string, diff: ValueDiffEntry[]): FieldTreeNode[] {
  const modifiedPaths = new Set(diff.filter(d => d.changed).map(d => d.path))

  function match(node: FieldTreeNode): boolean {
    if (search && !(node.label || node.name).toLowerCase().includes(search.toLowerCase()) && !node.path.toLowerCase().includes(search.toLowerCase())) return false
    if (filter === 'error' && node.errorCount === 0) return false
    if (filter === 'required' && !node.required) return false
    if (filter === 'modified' && !modifiedPaths.has(node.path)) return false
    return true
  }

  function filterNode(node: FieldTreeNode): FieldTreeNode | null {
    const filteredChildren = node.children.map(filterNode).filter(Boolean) as FieldTreeNode[]
    if (match(node) || filteredChildren.length > 0) {
      return { ...node, children: filteredChildren }
    }
    return null
  }

  return nodes.map(filterNode).filter(Boolean) as FieldTreeNode[]
}
