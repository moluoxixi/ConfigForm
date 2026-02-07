import type { FieldPattern } from '@moluoxixi/shared'
import { Alert, Segmented } from 'antd'
import React, { useCallback, useState } from 'react'

/** 三态选项 */
const MODE_OPTIONS = [
  { label: '编辑态', value: 'editable' as FieldPattern },
  { label: '阅读态', value: 'readOnly' as FieldPattern },
  { label: '禁用态', value: 'disabled' as FieldPattern },
]

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
 * 使用 antd Segmented 组件实现模式切换，Alert 组件展示提交结果。
 * 不包含 ConfigForm / FormProvider 等表单逻辑，由各场景文件自行实现。
 */
export function StatusTabs({ resultTitle = '提交结果', children }: StatusTabsProps): React.ReactElement {
  const [mode, setMode] = useState<FieldPattern>('editable')
  const [result, setResult] = useState('')

  /** 判断结果是否为错误 */
  const isError = result.startsWith('验证失败')

  /** 显示提交结果（JSON 格式） */
  const showResult = useCallback((data: Record<string, unknown>) => {
    setResult(JSON.stringify(data, null, 2))
  }, [])

  /** 显示验证错误列表 */
  const showErrors = useCallback((errors: Array<{ path: string, message: string }>) => {
    setResult(`验证失败:\n${errors.map(e => `[${e.path}] ${e.message}`).join('\n')}`)
  }, [])

  return (
    <>
      {/* 三态切换 */}
      <Segmented
        options={MODE_OPTIONS}
        value={mode}
        onChange={v => setMode(v as FieldPattern)}
        style={{ marginBottom: 16 }}
      />

      {/* 表单内容（由场景文件填充） */}
      {children({ mode, showResult, showErrors })}

      {/* 结果展示 */}
      {result && (
        <Alert
          type={isError ? 'error' : 'success'}
          message={resultTitle}
          description={<pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: 13 }}>{result}</pre>}
          style={{ marginTop: 16 }}
          showIcon
        />
      )}
    </>
  )
}
