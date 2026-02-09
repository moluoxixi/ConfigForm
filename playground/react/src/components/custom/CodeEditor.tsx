/**
 * 自定义组件：代码编辑器
 *
 * 基于 <textarea> 实现的简易代码编辑器，等宽字体 + 行号提示。
 * 实际项目可替换为 Monaco Editor / CodeMirror。
 */
import React from 'react'

interface CodeEditorProps {
  value?: string
  onChange?: (value: string) => void
  disabled?: boolean
  preview?: boolean
  language?: string
}

export function CodeEditor({ value = '', onChange, disabled, preview, language }: CodeEditorProps): React.ReactElement {
  const lines = (value || '').split('\n').length

  return (
    <div style={{ position: 'relative', border: '1px solid #d9d9d9', borderRadius: 6, overflow: 'hidden' }}>
      {language && (
        <div style={{ padding: '4px 12px', background: '#f5f5f5', borderBottom: '1px solid #d9d9d9', fontSize: 11, color: '#999', fontFamily: 'monospace' }}>
          {language} · {lines} 行
        </div>
      )}
      <textarea
        value={value}
        onChange={e => onChange?.(e.target.value)}
        disabled={disabled}
        readOnly={preview}
        spellCheck={false}
        style={{
          width: '100%', minHeight: 200, padding: '12px 16px', border: 'none', outline: 'none', resize: 'vertical',
          fontFamily: 'Consolas, Monaco, "Courier New", monospace', fontSize: 13, lineHeight: 1.6,
          background: '#fafafa', color: '#333', tabSize: 2,
        }}
      />
    </div>
  )
}
