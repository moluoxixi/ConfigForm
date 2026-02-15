/**
 * 自定义组件：Cron 表达式编辑器
 *
 * 手动输入 + 快捷预设按钮 + 实时解读。
 */
import React from 'react'

/** Cron 各段含义 */
const CRON_LABELS = ['分', '时', '日', '月', '周']

function normalizeParts(expr: string): string[] {
  const pieces = expr.trim().split(/\s+/).filter(Boolean)
  return CRON_LABELS.map((_, index) => pieces[index] ?? '*')
}

/** 简单的 Cron 解读（非完整解析） */
function describeCron(expr: string): string {
  const rawParts = expr.trim().split(/\s+/).filter(Boolean)
  if (rawParts.length < 5)
    return '格式错误（需要 5 段）'

  const [min, hour, day, month, weekday] = normalizeParts(expr)
  const desc: string[] = []

  if (weekday !== '*')
    desc.push(`周${weekday}`)
  if (month !== '*')
    desc.push(`${month}月`)
  if (day !== '*')
    desc.push(`${day}日`)
  if (hour !== '*')
    desc.push(`${hour}时`)
  if (min !== '*')
    desc.push(`${min}分`)
  if (min === '*' && hour === '*')
    desc.push('每分钟')
  else if (min === '0' && hour === '*')
    desc.push('每整点')

  return desc.join(' ') || '每分钟'
}

interface CronPreset {
  label: string
  value: string
}

interface CronEditorProps {
  value?: string
  onChange?: (value: string) => void
  presets?: CronPreset[]
  disabled?: boolean
  preview?: boolean
}

export function CronEditor({ value = '', onChange, presets = [], disabled, preview }: CronEditorProps): React.ReactElement {
  const parts = normalizeParts(value || '')

  const updatePart = (index: number, nextValue: string): void => {
    const nextParts = normalizeParts(value || '')
    const next = nextValue.trim()
    nextParts[index] = next.length > 0 ? next : '*'
    onChange?.(nextParts.join(' '))
  }

  return (
    <div style={{ border: '1px solid #d9d9d9', borderRadius: 6, padding: 12 }}>
      {/* 输入框 */}
      <input
        type="text"
        value={value}
        onChange={e => onChange?.(e.target.value)}
        disabled={disabled}
        readOnly={preview}
        placeholder="* * * * *"
        style={{
          width: '100%',
          padding: '6px 12px',
          border: '1px solid #d9d9d9',
          borderRadius: 4,
          fontFamily: 'monospace',
          fontSize: 14,
          marginBottom: 8,
          background: disabled || preview ? '#f5f5f5' : '#fff',
        }}
      />

      {/* 分段编辑 */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
        {CRON_LABELS.map((label, i) => (
          <div key={label} style={{ flex: 1, textAlign: 'center' }}>
            <input
              type="text"
              value={parts[i]}
              onChange={e => updatePart(i, e.target.value)}
              disabled={disabled}
              readOnly={preview}
              placeholder="*"
              style={{
                width: '100%',
                padding: '4px 6px',
                border: '1px solid #d9d9d9',
                borderRadius: 4,
                fontFamily: 'monospace',
                fontSize: 12,
                textAlign: 'center',
                background: disabled || preview ? '#f5f5f5' : '#fff',
              }}
            />
            <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* 解读 */}
      <div style={{ fontSize: 12, color: '#1677ff', marginBottom: 8 }}>
        解读：
        {describeCron(value)}
      </div>

      {/* 预设按钮 */}
      {presets.length > 0 && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {presets.map(p => (
            <button
              key={p.value}
              onClick={() => !disabled && !preview && onChange?.(p.value)}
              disabled={disabled || preview}
              style={{
                padding: '2px 8px',
                fontSize: 11,
                border: '1px solid #d9d9d9',
                borderRadius: 4,
                background: value === p.value ? '#e6f4ff' : '#fff',
                color: value === p.value ? '#1677ff' : '#333',
                cursor: disabled ? 'not-allowed' : 'pointer',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
