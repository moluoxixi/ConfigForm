/**
 * 场景 32：代码编辑器
 *
 * 覆盖：
 * - 代码编辑器集成（Textarea 模拟，实际接入 @monaco-editor/react）
 * - 语言选择
 * - 语法高亮预览
 * - 三种模式切换
 *
 * 自定义 CodeEditor 组件注册后，在 fieldProps 中通过 component: 'CodeEditor' 引用。
 * setupAntd() 注册的 Input / Select 等组件直接在 fieldProps.component 中按名称使用。
 */
import React from 'react'
import { observer } from 'mobx-react-lite'
import { FormField, FormProvider, registerComponent, useCreateForm } from '@moluoxixi/react'
import { LayoutFormActions, StatusTabs, setupAntd } from '@moluoxixi/ui-antd'

setupAntd()

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
  /* 只读或禁用：展示 pre 代码块 */
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

  /* 编辑态：textarea */
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

// ========== 表单组件 ==========

/**
 * 代码编辑器表单
 *
 * 展示代码编辑器集成、语言选择、三种模式切换
 */
export const CodeEditorForm = observer((): React.ReactElement => {
  const form = useCreateForm({
    initialValues: { title: '代码片段', language: 'javascript', code: DEFAULT_CODE },
  })

  return (
    <div>
      <h2>代码编辑器</h2>
      <p style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 16, fontSize: 14 }}>Textarea 模拟（可接入 @monaco-editor/react） / 语言选择 / 三种模式</p>
      <div style={{ padding: '8px 16px', marginBottom: 16, background: '#e6f4ff', border: '1px solid #91caff', borderRadius: 6, fontSize: 13 }}>此为简化版，实际项目请安装 @monaco-editor/react 获得语法高亮、自动补全等功能。</div>
      <StatusTabs>
        {({ mode, showResult, showErrors }) => {
          form.pattern = mode
          return (
            <FormProvider form={form}>
              <FormField name="title" fieldProps={{ label: '标题', required: true, component: 'Input', componentProps: { style: { width: 250 } } }} />
                <FormField name="language" fieldProps={{ label: '语言', component: 'Select', dataSource: LANGUAGES, componentProps: { style: { width: 160 } } }} />
                <FormField name="code" fieldProps={{ label: '代码', required: true, component: 'CodeEditor' }} />
                <LayoutFormActions onSubmit={showResult} onSubmitFailed={showErrors} />
            </FormProvider>
          )
        }}
      </StatusTabs>
    </div>
  )
})
