/**
 * 自定义组件：JSON 编辑器
 *
 * 基于 <textarea> 实现，支持格式化和基本语法错误检测。
 */
import React, { useCallback, useState } from 'react'

interface JsonEditorProps {
  value?: string
  onChange?: (value: string) => void
  disabled?: boolean
  readOnly?: boolean
}

export function JsonEditor({ value = '', onChange, disabled, readOnly }: JsonEditorProps): React.ReactElement {
  const [error, setError] = useState<string | null>(null)

  const handleChange = useCallback((raw: string) => {
    onChange?.(raw)
    try {
      JSON.parse(raw)
      setError(null)
    } catch (e) {
      setError((e as Error).message)
    }
  }, [onChange])

  const handleFormat = useCallback(() => {
    try {
      const parsed = JSON.parse(value)
      const formatted = JSON.stringify(parsed, null, 2)
      onChange?.(formatted)
      setError(null)
    } catch (e) {
      setError((e as Error).message)
    }
  }, [value, onChange])

  return (
    <div style={{ border: '1px solid #d9d9d9', borderRadius: 6, overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 12px', background: '#f5f5f5', borderBottom: '1px solid #d9d9d9' }}>
        <span style={{ fontSize: 11, color: error ? '#ff4d4f' : '#52c41a', fontFamily: 'monospace' }}>
          {error ? `语法错误: ${error.slice(0, 50)}` : 'JSON 格式正确'}
        </span>
        <button
          onClick={handleFormat}
          disabled={disabled || readOnly}
          style={{ padding: '2px 8px', fontSize: 11, border: '1px solid #d9d9d9', borderRadius: 4, background: '#fff', cursor: 'pointer' }}
        >
          格式化
        </button>
      </div>
      <textarea
        value={value}
        onChange={e => handleChange(e.target.value)}
        disabled={disabled}
        readOnly={readOnly}
        spellCheck={false}
        style={{
          width: '100%', minHeight: 200, padding: '12px 16px', border: 'none', outline: 'none', resize: 'vertical',
          fontFamily: 'Consolas, Monaco, "Courier New", monospace', fontSize: 13, lineHeight: 1.6,
          background: '#fafafa', color: '#333',
        }}
      />
    </div>
  )
}
