/**
 * 场景 33：JSON 编辑器
 *
 * 覆盖：
 * - JSON 编辑 + 格式化 + 验证
 * - 实时语法检查
 * - 三种模式切换
 *
 * 自定义 JsonEditor 组件注册后，在 fieldProps 中通过 component: 'JsonEditor' 引用。
 * 注：实际项目可接入 vanilla-jsoneditor
 */
import React, { useState } from 'react'
import { observer } from 'mobx-react-lite'
import { FormField, FormProvider, registerComponent, useCreateForm } from '@moluoxixi/react'
import { LayoutFormActions, StatusTabs, setupAntd } from '@moluoxixi/ui-antd'

setupAntd()

/** JSON 初始值 */
const DEFAULT_JSON = JSON.stringify(
  { name: '张三', age: 28, roles: ['admin', 'editor'], settings: { theme: 'dark', language: 'zh-CN' } },
  null,
  2,
)

/** 校验 JSON 字符串 */
function validateJson(str: string): { valid: boolean; error?: string } {
  try {
    JSON.parse(str)
    return { valid: true }
  }
  catch (e) {
    return { valid: false, error: (e as Error).message }
  }
}

// ========== 自定义组件：JSON 编辑器 ==========

/** JSON 编辑器 Props */
interface JsonEditorProps {
  /** JSON 字符串内容 */
  value?: string
  /** 值变更回调 */
  onChange?: (v: string) => void
  /** 是否禁用 */
  disabled?: boolean
  /** 是否只读 */
  readOnly?: boolean
}

/**
 * JSON 编辑器组件
 *
 * - 编辑态：格式化/压缩按钮 + textarea + 实时语法检查
 * - 只读/禁用态：pre 代码块展示
 */
const JsonEditor = observer(({ value, onChange, disabled, readOnly }: JsonEditorProps): React.ReactElement => {
  const [jsonError, setJsonError] = useState<string | null>(null)
  const isEditable = !disabled && !readOnly
  const content = value ?? ''

  /** 变更处理：更新值并校验 JSON */
  const handleChange = (newValue: string): void => {
    onChange?.(newValue)
    const check = validateJson(newValue)
    setJsonError(check.valid ? null : check.error ?? null)
  }

  /** 格式化 JSON */
  const formatJson = (): void => {
    try {
      const parsed = JSON.parse(content)
      onChange?.(JSON.stringify(parsed, null, 2))
      setJsonError(null)
    }
    catch {
      /* 格式化失败，保持原样 */
    }
  }

  /** 压缩 JSON */
  const minifyJson = (): void => {
    try {
      const parsed = JSON.parse(content)
      onChange?.(JSON.stringify(parsed))
      setJsonError(null)
    }
    catch {
      /* 压缩失败，保持原样 */
    }
  }

  return (
    <div>
      {/* 状态标签 + 操作按钮 */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
        {jsonError
          ? <span style={{ display: 'inline-block', padding: '0 7px', fontSize: 12, lineHeight: '20px', background: '#fff2f0', border: '1px solid #ffccc7', borderRadius: 4 }}>语法错误</span>
          : <span style={{ display: 'inline-block', padding: '0 7px', fontSize: 12, lineHeight: '20px', background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 4 }}>合法 JSON</span>}
        {isEditable && (
          <>
            <button type="button" onClick={formatJson} style={{ padding: '2px 8px', background: '#fff', border: '1px solid #d9d9d9', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>格式化</button>
            <button type="button" onClick={minifyJson} style={{ padding: '2px 8px', background: '#fff', border: '1px solid #d9d9d9', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>压缩</button>
          </>
        )}
      </div>

      {isEditable
        ? (
            <textarea
              value={content}
              onChange={e => handleChange(e.target.value)}
              rows={14}
              style={{ width: '100%', fontFamily: 'Consolas, Monaco, monospace', fontSize: 13, padding: 8, border: '1px solid #d9d9d9', borderRadius: 6, resize: 'vertical' }}
            />
          )
        : (
            <pre style={{
              padding: 16,
              borderRadius: 8,
              background: '#f6f8fa',
              fontSize: 13,
              fontFamily: 'Consolas, Monaco, monospace',
              overflow: 'auto',
              maxHeight: 400,
              opacity: disabled ? 0.6 : 1,
            }}
            >
              {content || '{}'}
            </pre>
          )}

      {/* JSON 错误信息 */}
      {jsonError && (
        <div style={{ color: '#ff4d4f', fontSize: 12, marginTop: 4 }}>{jsonError}</div>
      )}
    </div>
  )
})

registerComponent('JsonEditor', JsonEditor, { defaultWrapper: 'FormItem' })

// ========== 表单组件 ==========

/**
 * JSON 编辑器表单
 *
 * 展示 JSON 编辑、格式化、压缩、实时语法检查、三种模式切换
 */
export const JsonEditorForm = observer((): React.ReactElement => {
  const form = useCreateForm({ initialValues: { configName: 'API 配置', jsonContent: DEFAULT_JSON } })

  return (
    <div>
      <h3>JSON 编辑器</h3>
      <p style={{ color: '#666' }}>JSON 编辑 + 格式化 + 压缩 + 实时语法检查</p>
      <StatusTabs>
        {({ mode, showResult, showErrors }) => {
          form.pattern = mode
          return (
            <FormProvider form={form}>
              <form onSubmit={async (e: React.FormEvent) => {
                e.preventDefault()
                const res = await form.submit()
                if (res.errors.length > 0) showErrors(res.errors)
                else showResult(res.values)
              }} noValidate>
                <FormField name="configName" fieldProps={{ label: '配置名称', required: true, component: 'Input' }} />
                <FormField name="jsonContent" fieldProps={{ label: 'JSON 内容', required: true, component: 'JsonEditor' }} />
                {<LayoutFormActions onReset={() => form.reset()} />}
              </form>
            </FormProvider>
          )
        }}
      </StatusTabs>
    </div>
  )
})
