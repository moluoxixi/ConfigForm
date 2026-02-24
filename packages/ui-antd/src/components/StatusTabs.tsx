import type { FieldPattern } from '@moluoxixi/core'
import { Alert, Segmented } from 'antd'
import React, { useCallback, useState } from 'react'

/** 三态选项 */
const MODE_OPTIONS = [
  { label: '编辑态', value: 'editable' as FieldPattern },
  { label: '预览态', value: 'preview' as FieldPattern },
  { label: '禁用态', value: 'disabled' as FieldPattern },
]

/**
 * 格式化值为可读字符串
 * @param val 参数 `val`用于提供待处理的值并参与结果计算。
 * @returns 返回字符串结果，通常用于文本展示或下游拼接。
 */
function formatValue(val: unknown): string {
  if (val === null || val === undefined || val === '')
    return '—'
  if (typeof val === 'boolean')
    return val ? '是' : '否'
  if (Array.isArray(val))
    return val.length === 0 ? '—' : JSON.stringify(val)
  if (typeof val === 'object')
    return JSON.stringify(val, null, 2)
  return String(val)
}

/**
 * Status Tabs Props：类型接口定义。
 * 所属模块：`packages/ui-antd/src/components/StatusTabs.tsx`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export interface StatusTabsProps {
  /** 结果区域标题 */
  resultTitle?: string
  /** 渲染函数，接收 mode + showResult + showErrors */
  children: (ctx: {
    mode: FieldPattern
    showResult: (data: Record<string, unknown>) => void
    showErrors: (errors: Array<{ path: string, message: string }>) => void
  }) => React.ReactNode
}

/**
 * Playground 通用三态切换 + 结果展示容器
 *
 * 使用 antd Segmented 组件实现模式切换，结构化表格展示提交结果。
 * 不包含 ConfigForm / FormProvider 等表单逻辑，由各场景文件自行实现。
 * @param param1 原始解构参数（{ resultTitle = '提交结果', children }）用于提供当前函数执行所需的输入信息。
 * @param param1.resultTitle 参数 resultTitle 的输入说明。
 * @param param1.children 参数 children 的输入说明。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
 */
export function StatusTabs({ resultTitle = '提交结果', children }: StatusTabsProps): React.ReactElement {
  const [mode, setMode] = useState<FieldPattern>('editable')
  const [resultData, setResultData] = useState<Record<string, unknown> | null>(null)
  const [errorText, setErrorText] = useState('')

  /** 显示提交结果（结构化展示） */
  const showResult = useCallback((data: Record<string, unknown>) => {
    setResultData(data)
    setErrorText('')
  }, [])

  /** 显示验证错误列表 */
  const showErrors = useCallback((errors: Array<{ path: string, message: string }>) => {
    setResultData(null)
    setErrorText(errors.map(e => `[${e.path}] ${e.message}`).join('\n'))
  }, [])

  return (
    <div style={{ height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      {/* 三态切换 */}
      <Segmented
        options={MODE_OPTIONS}
        value={mode}
        onChange={v => setMode(v as FieldPattern)}
        style={{ marginBottom: 16 }}
      />

      <div style={{ flex: 1, minHeight: 0 }}>
        {/* 表单内容（由场景文件填充） */}
        {children({ mode, showResult, showErrors })}

        {/* 错误展示 */}
        {errorText && (
          <Alert
            type="error"
            message="验证失败"
            description={<pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: 13, color: '#ff4d4f' }}>{errorText}</pre>}
            style={{ marginTop: 16 }}
            showIcon
          />
        )}

        {/* 成功结果展示（字段表格） */}
        {resultData && (
          <div style={{ marginTop: 16, border: '1px solid #b7eb8f', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ padding: '8px 16px', background: '#f6ffed', fontWeight: 600, color: '#52c41a', borderBottom: '1px solid #b7eb8f', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 16 }}>✓</span>
              {resultTitle}
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#fafafa' }}>
                  <th style={{ padding: '8px 16px', textAlign: 'left', borderBottom: '1px solid #f0f0f0', color: '#666', width: 180 }}>字段</th>
                  <th style={{ padding: '8px 16px', textAlign: 'left', borderBottom: '1px solid #f0f0f0', color: '#666' }}>值</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(resultData).map(([key, val], idx) => (
                  <tr key={key} style={idx % 2 === 1 ? { background: '#fafafa' } : undefined}>
                    <td style={{ padding: '6px 16px', borderBottom: '1px solid #f0f0f0', fontWeight: 500, color: '#333' }}>{key}</td>
                    <td style={{ padding: '6px 16px', borderBottom: '1px solid #f0f0f0', color: '#555', wordBreak: 'break-all' }}>{formatValue(val)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
