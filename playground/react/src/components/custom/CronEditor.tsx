/**
 * 自定义组件：Cron 表达式编辑器
 *
 * 分段编辑 + 输入框 + 预设按钮 + 简易解读。
 */
import React from 'react'

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

const CRON_LABELS = ['分', '时', '日', '月', '周']

function normalizeParts(expr: string): string[] {
  const pieces = expr.trim().split(/\s+/).filter(Boolean)
  return CRON_LABELS.map((_, index) => pieces[index] ?? '*')
}

function describeCron(expr: string): string {
  const trimmed = expr.trim()
  return trimmed.length > 0 ? trimmed : '—'
}

/**
 * CronEditor：执行当前功能逻辑。
 *
 * @returns 返回当前功能的处理结果。
 */
export function CronEditor({ value = '', onChange, presets = [], disabled, preview }: CronEditorProps): React.ReactElement {
  const isDisabled = Boolean(disabled || preview)
  const parts = normalizeParts(value || '')

  const updatePart = (index: number, nextValue: string): void => {
    const nextParts = normalizeParts(value || '')
    const next = nextValue.trim()
    nextParts[index] = next.length > 0 ? next : '*'
    onChange?.(nextParts.join(' '))
  }

  return (
    <div style={{ border: '1px solid #d9d9d9', borderRadius: 6, padding: 12 }}>
      <input
        type="text"
        value={value}
        onChange={e => onChange?.(e.target.value)}
        disabled={isDisabled}
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
          background: isDisabled ? '#f5f5f5' : '#fff',
        }}
      />

      <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
        {CRON_LABELS.map((label, i) => (
          <div key={label} style={{ flex: 1, textAlign: 'center' }}>
            <input
              type="text"
              value={parts[i]}
              onChange={e => updatePart(i, e.target.value)}
              disabled={isDisabled}
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
                background: isDisabled ? '#f5f5f5' : '#fff',
              }}
            />
            <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 12, color: '#1677ff', marginBottom: 8 }}>
        解读：
        {describeCron(value)}
      </div>

      {presets.length > 0 && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {presets.map(p => (
            <button
              key={p.value}
              onClick={() => !isDisabled && onChange?.(p.value)}
              disabled={isDisabled}
              style={{
                padding: '2px 8px',
                fontSize: 11,
                border: '1px solid #d9d9d9',
                borderRadius: 4,
                background: value === p.value ? '#e6f4ff' : '#fff',
                color: value === p.value ? '#1677ff' : '#333',
                cursor: isDisabled ? 'not-allowed' : 'pointer',
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
