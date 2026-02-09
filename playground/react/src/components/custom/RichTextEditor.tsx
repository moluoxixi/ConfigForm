/**
 * 自定义组件：富文本编辑器
 *
 * 基于 contentEditable 实现的简易富文本编辑器。
 * 支持加粗、斜体、下划线工具栏。
 * 实际项目可替换为 TipTap / Slate / Quill。
 */
import React, { useCallback, useRef } from 'react'

interface RichTextEditorProps {
  value?: string
  onChange?: (value: string) => void
  disabled?: boolean
  readOnly?: boolean
}

function ToolButton({ label, command, disabled }: { label: string, command: string, disabled?: boolean }): React.ReactElement {
  return (
    <button
      onMouseDown={(e) => {
        e.preventDefault()
        if (!disabled) document.execCommand(command)
      }}
      disabled={disabled}
      style={{ padding: '2px 8px', fontSize: 12, border: '1px solid #d9d9d9', borderRadius: 4, background: '#fff', cursor: disabled ? 'not-allowed' : 'pointer', fontWeight: command === 'bold' ? 700 : 400, fontStyle: command === 'italic' ? 'italic' : 'normal', textDecoration: command === 'underline' ? 'underline' : 'none' }}
    >
      {label}
    </button>
  )
}

export function RichTextEditor({ value = '', onChange, disabled, readOnly }: RichTextEditorProps): React.ReactElement {
  const editorRef = useRef<HTMLDivElement>(null)

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange?.(editorRef.current.innerHTML)
    }
  }, [onChange])

  return (
    <div style={{ border: '1px solid #d9d9d9', borderRadius: 6, overflow: 'hidden' }}>
      {/* 工具栏 */}
      <div style={{ display: 'flex', gap: 4, padding: '6px 12px', background: '#fafafa', borderBottom: '1px solid #eee' }}>
        <ToolButton label="B" command="bold" disabled={disabled || readOnly} />
        <ToolButton label="I" command="italic" disabled={disabled || readOnly} />
        <ToolButton label="U" command="underline" disabled={disabled || readOnly} />
      </div>
      {/* 编辑区 */}
      <div
        ref={editorRef}
        contentEditable={!disabled && !readOnly}
        onInput={handleInput}
        dangerouslySetInnerHTML={{ __html: value }}
        style={{
          minHeight: 200, padding: '12px 16px', outline: 'none',
          fontSize: 14, lineHeight: 1.8,
        }}
      />
    </div>
  )
}
