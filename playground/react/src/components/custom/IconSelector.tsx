/**
 * 自定义组件：图标选择器
 *
 * 从预设图标列表中选择，支持搜索过滤。
 * 使用 emoji 作为图标演示（实际项目可替换为 Ant Design Icons）。
 */
import React, { useMemo, useState } from 'react'

/** 预设图标 */
const ICONS: Array<{ name: string, icon: string }> = [
  { name: 'Home', icon: '🏠' }, { name: 'User', icon: '👤' }, { name: 'Settings', icon: '⚙️' },
  { name: 'Search', icon: '🔍' }, { name: 'Mail', icon: '📧' }, { name: 'Phone', icon: '📞' },
  { name: 'Star', icon: '⭐' }, { name: 'Heart', icon: '❤️' }, { name: 'Lock', icon: '🔒' },
  { name: 'Edit', icon: '✏️' }, { name: 'Delete', icon: '🗑️' }, { name: 'Check', icon: '✅' },
  { name: 'Close', icon: '❌' }, { name: 'Info', icon: 'ℹ️' }, { name: 'Warning', icon: '⚠️' },
  { name: 'Calendar', icon: '📅' }, { name: 'Clock', icon: '🕐' }, { name: 'File', icon: '📄' },
  { name: 'Folder', icon: '📁' }, { name: 'Camera', icon: '📷' }, { name: 'Bell', icon: '🔔' },
  { name: 'Cart', icon: '🛒' }, { name: 'Chart', icon: '📊' }, { name: 'Cloud', icon: '☁️' },
]

interface IconSelectorProps {
  value?: string
  onChange?: (value: string) => void
  disabled?: boolean
  readOnly?: boolean
}

export function IconSelector({ value = '', onChange, disabled, readOnly }: IconSelectorProps): React.ReactElement {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search) return ICONS
    return ICONS.filter(i => i.name.toLowerCase().includes(search.toLowerCase()))
  }, [search])

  const selectedIcon = ICONS.find(i => i.name === value)

  return (
    <div style={{ border: '1px solid #d9d9d9', borderRadius: 6, padding: 12, maxWidth: 400 }}>
      {/* 当前选中 */}
      <div style={{ marginBottom: 8, fontSize: 13 }}>
        已选：{selectedIcon ? <span>{selectedIcon.icon} {selectedIcon.name}</span> : <span style={{ color: '#999' }}>未选择</span>}
      </div>
      {/* 搜索 */}
      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="搜索图标..."
        disabled={disabled || readOnly}
        style={{ width: '100%', padding: '4px 8px', border: '1px solid #d9d9d9', borderRadius: 4, marginBottom: 8, fontSize: 12 }}
      />
      {/* 网格 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 4 }}>
        {filtered.map(item => (
          <button
            key={item.name}
            onClick={() => !disabled && !readOnly && onChange?.(item.name)}
            disabled={disabled || readOnly}
            title={item.name}
            style={{
              padding: 6, fontSize: 20, border: value === item.name ? '2px solid #1677ff' : '1px solid #eee',
              borderRadius: 6, background: value === item.name ? '#e6f4ff' : '#fff',
              cursor: disabled ? 'not-allowed' : 'pointer', textAlign: 'center',
            }}
          >
            {item.icon}
          </button>
        ))}
      </div>
    </div>
  )
}
