import type { ISchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/shared'
import { ConfigForm, registerComponent } from '@moluoxixi/react'
import { setupAntd, StatusTabs } from '@moluoxixi/ui-antd'
import { Typography } from 'antd'
import { observer } from 'mobx-react-lite'
/**
 * 场景 32：代码编辑器 — ConfigForm + Schema
 *
 * 覆盖：
 * - 自定义 CodeEditor 组件注册
 * - 语言选择
 * - 三种模式切换
 */
import React from 'react'

const { Title, Paragraph } = Typography

setupAntd()

/** 工具：将 StatusTabs 的 mode 注入 schema */
function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}

/** 语言选项 */
const LANGUAGES = [
  { label: 'JavaScript', value: 'javascript' },
  { label: 'TypeScript', value: 'typescript' },
  { label: 'Python', value: 'python' },
  { label: 'JSON', value: 'json' },
  { label: 'HTML', value: 'html' },
  { label: 'CSS', value: 'css' },
]

/** 代码初始值 */
const DEFAULT_CODE = `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10));`

/** 代码块公共样式 */
const CODE_STYLE: React.CSSProperties = {
  fontFamily: 'Consolas, Monaco, monospace',
  fontSize: 13,
  background: '#1e1e1e',
  color: '#d4d4d4',
}

// ========== 自定义组件：代码编辑器 ==========

/** 代码编辑器组件 Props */
interface CodeEditorProps {
  /** 代码内容 */
  value?: string
  /** 值变更回调 */
  onChange?: (v: string) => void
  /** 是否禁用 */
  disabled?: boolean
  /** 是否只读 */
  readOnly?: boolean
}

/**
 * 代码编辑器组件
 *
 * - 编辑态：textarea 编辑器
 * - 只读/禁用态：pre 代码块展示
 */
const CodeEditor = observer(({ value, onChange, disabled, readOnly }: CodeEditorProps): React.ReactElement => {
  if (readOnly || disabled) {
    return (
      <pre style={{
        ...CODE_STYLE,
        padding: 16,
        borderRadius: 8,
        overflow: 'auto',
        maxHeight: 400,
        margin: 0,
        opacity: disabled ? 0.6 : 1,
      }}
      >
        {value || '// 暂无代码'}
      </pre>
    )
  }
  return (
    <textarea
      value={value ?? ''}
      onChange={e => onChange?.(e.target.value)}
      rows={12}
      style={{
        ...CODE_STYLE,
        width: '100%',
        padding: 12,
        borderRadius: 8,
        border: '1px solid #d9d9d9',
        resize: 'vertical',
        outline: 'none',
      }}
    />
  )
})

registerComponent('CodeEditor', CodeEditor, { defaultWrapper: 'FormItem' })

// ========== Schema & 初始值 ==========

/** 默认初始值 */
const INITIAL_VALUES: Record<string, unknown> = {
  title: '代码片段',
  language: 'javascript',
  code: DEFAULT_CODE,
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
    title: {
      type: 'string',
      title: '标题',
      required: true,
      component: 'Input',
      componentProps: { style: { width: 250 } },
    },
    language: {
      type: 'string',
      title: '语言',
      component: 'Select',
      enum: LANGUAGES,
      componentProps: { style: { width: 160 } },
    },
    code: {
      type: 'string',
      title: '代码',
      required: true,
      component: 'CodeEditor',
    },
  },
}

/**
 * 代码编辑器表单 — ConfigForm + Schema
 *
 * 展示代码编辑器集成、语言选择、三种模式切换
 */
export const CodeEditorForm = observer((): React.ReactElement => (
  <div>
    <Title level={3}>代码编辑器</Title>
    <Paragraph type="secondary">Textarea 模拟代码编辑器 / 语言选择 / 三种模式 — ConfigForm + Schema</Paragraph>
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
