import type { ISchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/shared'
import { ConfigForm, registerComponent } from '@moluoxixi/react'
import { setupAntd, StatusTabs } from '@moluoxixi/ui-antd'
import { Col, Input, Row, Typography } from 'antd'
import { observer } from 'mobx-react-lite'
/**
 * 场景 37：Markdown 编辑器 — ConfigForm + Schema
 *
 * 覆盖：
 * - 自定义 MarkdownEditor 组件注册
 * - Markdown 编辑 + 实时预览
 * - 三种模式切换
 */
import React from 'react'

const { Title, Paragraph, Text } = Typography

setupAntd()

/** 工具：将 StatusTabs 的 mode 注入 schema */
function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}

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

/**
 * 简单 Markdown → HTML 转换（实际项目用 marked 等库）
 *
 * @param md - Markdown 源文本
 * @returns 转换后的 HTML 字符串
 */
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
      <Row gutter={16}>
        <Col span={12}>
          <Text type="secondary" style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>编辑区</Text>
          <Input.TextArea
            value={content}
            onChange={e => onChange?.(e.target.value)}
            rows={16}
            style={{ fontFamily: 'Consolas, Monaco, monospace', fontSize: 13 }}
          />
        </Col>
        <Col span={12}>
          <Text type="secondary" style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>预览区</Text>
          <div
            style={{ border: '1px solid #d9d9d9', borderRadius: 6, padding: 12, minHeight: 380, overflow: 'auto', background: '#fafafa' }}
            dangerouslySetInnerHTML={{ __html: simpleMarkdownToHtml(content) }}
          />
        </Col>
      </Row>
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

// ========== Schema & 初始值 ==========

/** 默认初始值 */
const INITIAL_VALUES: Record<string, unknown> = {
  docTitle: '使用指南',
  content: DEFAULT_MD,
}

/** 表单 Schema */
const schema: ISchema = {
  type: 'object',
  decoratorProps: {
    labelPosition: 'right',
    labelWidth: '120px',
    actions: { submit: '提交', reset: '重置' },
  },
  properties: {
    docTitle: {
      type: 'string',
      title: '文档标题',
      required: true,
      component: 'Input',
    },
    content: {
      type: 'string',
      title: 'Markdown 内容',
      required: true,
      component: 'MarkdownEditor',
    },
  },
}

/**
 * Markdown 编辑器表单 — ConfigForm + Schema
 *
 * 展示 Markdown 编写、实时预览、三种模式切换
 */
export const MarkdownEditorForm = observer((): React.ReactElement => (
  <div>
    <Title level={3}>Markdown 编辑器</Title>
    <Paragraph type="secondary">Markdown 编写 + 实时预览 / 三种模式（可接入 @bytemd/react） — ConfigForm + Schema</Paragraph>
    <StatusTabs>
      {({ mode, showResult, showErrors }) => (
        <ConfigForm
          schema={withMode(schema, mode)}
          initialValues={INITIAL_VALUES}
          onSubmit={showResult}
          onSubmitFailed={errors => showErrors(errors)}
        />
      )}
    </StatusTabs>
  </div>
))
