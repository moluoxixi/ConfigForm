/**
 * 自定义组件：Markdown 编辑器
 *
 * 左侧编辑、右侧简易预览（纯文本标记高亮）。
 * 实际项目可替换为 react-markdown + remark。
 */
import React from 'react'

interface MarkdownEditorProps {
  value?: string
  onChange?: (value: string) => void
  disabled?: boolean
  readOnly?: boolean
}

/** 简易 Markdown → HTML（仅处理标题、加粗、斜体、代码、列表、引用） */
function simpleMarkdownToHtml(md: string): string {
  return md
    .replace(/^### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^## (.+)$/gm, '<h3>$1</h3>')
    .replace(/^# (.+)$/gm, '<h2>$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code style="background:#f5f5f5;padding:2px 4px;border-radius:3px">$1</code>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/^> (.+)$/gm, '<blockquote style="border-left:3px solid #d9d9d9;padding-left:12px;color:#666">$1</blockquote>')
    .replace(/\n/g, '<br/>')
}

export function MarkdownEditor({ value = '', onChange, disabled, readOnly }: MarkdownEditorProps): React.ReactElement {
  return (
    <div style={{ display: 'flex', gap: 12, border: '1px solid #d9d9d9', borderRadius: 6, overflow: 'hidden' }}>
      {/* 编辑区 */}
      <div style={{ flex: 1, borderRight: '1px solid #d9d9d9' }}>
        <div style={{ padding: '4px 12px', background: '#f5f5f5', fontSize: 11, color: '#999', borderBottom: '1px solid #eee' }}>编辑</div>
        <textarea
          value={value}
          onChange={e => onChange?.(e.target.value)}
          disabled={disabled}
          readOnly={readOnly}
          style={{
            width: '100%', minHeight: 200, padding: '12px 16px', border: 'none', outline: 'none', resize: 'vertical',
            fontFamily: 'Consolas, Monaco, monospace', fontSize: 13, lineHeight: 1.6,
          }}
        />
      </div>
      {/* 预览区 */}
      <div style={{ flex: 1 }}>
        <div style={{ padding: '4px 12px', background: '#f5f5f5', fontSize: 11, color: '#999', borderBottom: '1px solid #eee' }}>预览</div>
        <div
          style={{ padding: '12px 16px', fontSize: 14, lineHeight: 1.8, minHeight: 200 }}
          dangerouslySetInnerHTML={{ __html: simpleMarkdownToHtml(value) }}
        />
      </div>
    </div>
  )
}
