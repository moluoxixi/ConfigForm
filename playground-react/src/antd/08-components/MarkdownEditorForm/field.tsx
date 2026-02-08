/**
 * 场景 37：Markdown 编辑器
 *
 * 覆盖：
 * - Markdown 编辑 + 实时预览
 * - 三种模式切换
 *
 * 自定义 MarkdownEditor 组件注册后，在 fieldProps 中通过 component: 'MarkdownEditor' 引用。
 * 注：实际项目可接入 @bytemd/react
 */
import React from 'react'
import { observer } from 'mobx-react-lite'
import { FormField, FormProvider, registerComponent, useCreateForm } from '@moluoxixi/react'
import { LayoutFormActions, StatusTabs, setupAntd } from '@moluoxixi/ui-antd'

setupAntd()

/** Markdown 初始内容 */
const DEFAULT_MD = `# 标题

## 二级标题

这是一段 **加粗** 文字，支持 *斜体* 和 \`行内代码\`。

- 列表项 1
- 列表项 2
- 列表项 3

> 引用文字

\`\`\`javascript
function hello() {
  console.log("Hello World!");
}
\`\`\``

/** 简单 Markdown → HTML 转换（实际项目用 marked 等库） */
function simpleMarkdownToHtml(md: string): string {
  return md
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code style="background:#f0f0f0;padding:2px 4px;border-radius:3px">$1</code>')
    .replace(/^> (.*$)/gm, '<blockquote style="border-left:3px solid #ddd;padding-left:12px;color:#666">$1</blockquote>')
    .replace(/^- (.*$)/gm, '<li>$1</li>')
    .replace(/\n/g, '<br/>')
}

// ========== 自定义组件：Markdown 编辑器 ==========

/** Markdown 编辑器 Props */
interface MarkdownEditorProps {
  /** Markdown 内容 */
  value?: string
  /** 值变更回调 */
  onChange?: (v: string) => void
  /** 是否禁用 */
  disabled?: boolean
  /** 是否只读 */
  readOnly?: boolean
}

/**
 * Markdown 编辑器组件
 *
 * - 编辑态：左右分栏（编辑区 + 预览区）
 * - 只读/禁用态：渲染后的 HTML 预览
 */
const MarkdownEditor = observer(({ value, onChange, disabled, readOnly }: MarkdownEditorProps): React.ReactElement => {
  const isEditable = !disabled && !readOnly
  const content = value ?? ''

  if (isEditable) {
    return (
      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <span style={{ display: 'block', marginBottom: 4, fontSize: 12, color: '#999' }}>编辑区</span>
          <textarea
            value={content}
            onChange={e => onChange?.(e.target.value)}
            rows={16}
            style={{ width: '100%', fontFamily: 'Consolas, Monaco, monospace', fontSize: 13, padding: 8, border: '1px solid #d9d9d9', borderRadius: 6, resize: 'vertical' }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <span style={{ display: 'block', marginBottom: 4, fontSize: 12, color: '#999' }}>预览区</span>
          <div
            style={{ border: '1px solid #d9d9d9', borderRadius: 6, padding: 12, minHeight: 380, overflow: 'auto', background: '#fafafa' }}
            dangerouslySetInnerHTML={{ __html: simpleMarkdownToHtml(content) }}
          />
        </div>
      </div>
    )
  }

  return (
    <div
      style={{ border: '1px solid #d9d9d9', borderRadius: 6, padding: 16, background: '#fafafa', opacity: disabled ? 0.6 : 1 }}
      dangerouslySetInnerHTML={{ __html: simpleMarkdownToHtml(content) }}
    />
  )
})

registerComponent('MarkdownEditor', MarkdownEditor, { defaultWrapper: 'FormItem' })

// ========== 表单组件 ==========

/**
 * Markdown 编辑器表单
 *
 * 展示 Markdown 编写、实时预览、三种模式切换
 */
export const MarkdownEditorForm = observer((): React.ReactElement => {
  const form = useCreateForm({ initialValues: { docTitle: '使用指南', content: DEFAULT_MD } })

  return (
    <div>
      <h3>Markdown 编辑器</h3>
      <p style={{ color: '#666' }}>Markdown 编写 + 实时预览 / 三种模式（可接入 @bytemd/react）</p>
      <StatusTabs>
        {({ mode, showResult, showErrors }) => {
          form.pattern = mode
          return (
            <FormProvider form={form}>
                <FormField name="docTitle" fieldProps={{ label: '文档标题', required: true, component: 'Input' }} />
                <FormField name="content" fieldProps={{ label: 'Markdown 内容', required: true, component: 'MarkdownEditor' }} />
                <LayoutFormActions onSubmit={showResult} onSubmitFailed={showErrors} />
            </FormProvider>
          )
        }}
      </StatusTabs>
    </div>
  )
})
