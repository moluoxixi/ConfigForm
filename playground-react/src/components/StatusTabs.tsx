import type { FieldPattern } from '@moluoxixi/shared'
/**
 * Playground ??????React ??
 *
 * ?????? / ??? / ??? ?? + ?????
 * ??? ConfigForm / FormProvider ?????????????????
 */
import React, { useCallback, useState } from 'react'

const MODE_OPTIONS: Array<{ label: string, value: FieldPattern }> = [
  { label: '???', value: 'editable' },
  { label: '???', value: 'readOnly' },
  { label: '???', value: 'disabled' },
]

export interface StatusTabsProps {
  /** ????? */
  resultTitle?: string
  /** ????? mode + showResult */
  children: (ctx: {
    mode: FieldPattern
    showResult: (data: Record<string, unknown>) => void
    showErrors: (errors: Array<{ path: string, message: string }>) => void
  }) => React.ReactNode
}

export function StatusTabs({ resultTitle = '????', children }: StatusTabsProps): React.ReactElement {
  const [mode, setMode] = useState<FieldPattern>('editable')
  const [result, setResult] = useState('')

  const isError = result.startsWith('????')

  const showResult = useCallback((data: Record<string, unknown>) => {
    setResult(JSON.stringify(data, null, 2))
  }, [])

  const showErrors = useCallback((errors: Array<{ path: string, message: string }>) => {
    setResult(`????:\n${errors.map(e => `[${e.path}] ${e.message}`).join('\n')}`)
  }, [])

  return (
    <>
      {/* ?????? HTML? */}
      <div style={{ display: 'inline-flex', background: '#f5f5f5', borderRadius: 6, padding: 2, marginBottom: 16 }}>
        {MODE_OPTIONS.map(opt => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setMode(opt.value)}
            style={{
              padding: '4px 16px',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 14,
              background: mode === opt.value ? '#fff' : 'transparent',
              boxShadow: mode === opt.value ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
              fontWeight: mode === opt.value ? 600 : 'normal',
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* ???? */}
      {children({ mode, showResult, showErrors })}

      {/* ???? */}
      {result && (
        <div style={{
          marginTop: 16,
          padding: '12px 16px',
          borderRadius: 6,
          border: `1px solid ${isError ? '#ffccc7' : '#b7eb8f'}`,
          background: isError ? '#fff2f0' : '#f6ffed',
        }}
        >
          <div style={{ fontWeight: 600, marginBottom: 4, color: isError ? '#ff4d4f' : '#52c41a' }}>
            {resultTitle}
          </div>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: 13 }}>{result}</pre>
        </div>
      )}
    </>
  )
}
