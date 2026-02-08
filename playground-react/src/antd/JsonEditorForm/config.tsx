import type { ISchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/shared'
import { ConfigForm, registerComponent } from '@moluoxixi/react'
import { setupAntd, StatusTabs } from '@moluoxixi/ui-antd'
import { observer } from 'mobx-react-lite'
/**
 * 场景 33：JSON 编辑器 — ConfigForm + Schema
 *
 * 覆盖：
 * - 自定义 JsonEditor 组件注册
 * - JSON 编辑 + 格式化 + 验证
 * - 实时语法检查
 * - 三种模式切换
 */
import React, { useState } from 'react'

setupAntd()

/** 工具：将 StatusTabs 的 mode 注入 schema */
function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}

/** JSON 初始值 */
const DEFAULT_JSON = JSON.stringify(
  { name: '张三', age: 28, roles: ['admin', 'editor'], settings: { theme: 'dark', language: 'zh-CN' } },
  null,
  2,
)

/**
 * 校验 JSON 字符串
 *
 * @param str - 待校验的 JSON 字符串
 * @returns 校验结果
 */
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
          ? <span style={{ display: 'inline-block', padding: '0 7px', fontSize: 12, background: '#fff2f0', border: '1px solid #ffccc7', borderRadius: 4, color: '#ff4d4f' }}>语法错误</span>
          : <span style={{ display: 'inline-block', padding: '0 7px', fontSize: 12, background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 4, color: '#52c41a' }}>合法 JSON</span>}
        {isEditable && (
          <>
            <button type="button" onClick={formatJson} style={{ padding: '2px 8px', border: '1px solid #d9d9d9', borderRadius: 4, background: '#fff', cursor: 'pointer', fontSize: 13 }}>格式化</button>
            <button type="button" onClick={minifyJson} style={{ padding: '2px 8px', border: '1px solid #d9d9d9', borderRadius: 4, background: '#fff', cursor: 'pointer', fontSize: 13 }}>压缩</button>
          </>
        )}
      </div>

      {isEditable
        ? (
            <textarea
              value={content}
              onChange={e => handleChange(e.target.value)}
              rows={14}
              style={{ width: '100%', fontFamily: 'Consolas, Monaco, monospace', fontSize: 13, padding: '4px 8px', border: '1px solid #d9d9d9', borderRadius: 6 }}
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

// ========== Schema & 初始值 ==========

/** 默认初始值 */
const INITIAL_VALUES: Record<string, unknown> = {
  configName: 'API 配置',
  jsonContent: DEFAULT_JSON,
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
    configName: {
      type: 'string',
      title: '配置名称',
      required: true,
      component: 'Input',
    },
    jsonContent: {
      type: 'string',
      title: 'JSON 内容',
      required: true,
      component: 'JsonEditor',
    },
  },
}

/**
 * JSON 编辑器表单 — ConfigForm + Schema
 *
 * 展示 JSON 编辑、格式化、压缩、实时语法检查、三种模式切换
 */
export const JsonEditorForm = observer((): React.ReactElement => (
  <div>
    <h2>JSON 编辑器</h2>
    <p style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 16, fontSize: 14 }}>JSON 编辑 + 格式化 + 压缩 + 实时语法检查 — ConfigForm + Schema</p>
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
