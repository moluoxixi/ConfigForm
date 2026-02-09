import type { PerfMetrics, PerfMonitorAPI } from '@moluoxixi/plugin-lower-code'
import type { ReactElement } from 'react'
import React, { useCallback, useEffect, useState } from 'react'
import { useForm } from '../hooks/useForm'

export interface DevToolsProps {
  /** 初始是否展开 */
  defaultExpanded?: boolean
}

/**
 * DevTools — 开发者面板
 *
 * 展示实时性能指标（字段数量、联动次数、验证耗时等）。
 * 仅在开发环境渲染。
 *
 * 使用方式：
 * 1. 安装 perfMonitor 插件
 * 2. 在表单内放置 <DevTools />
 */
export function DevTools({ defaultExpanded = false }: DevToolsProps): ReactElement | null {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const [metrics, setMetrics] = useState<PerfMetrics | null>(null)

  let form: ReturnType<typeof useForm> | null = null
  try {
    form = useForm()
  } catch {
    return null
  }

  useEffect(() => {
    if (!form) return

    const api = form.getPlugin<PerfMonitorAPI>('perf-monitor')
    if (!api) return

    setMetrics(api.getMetrics())
    return api.onMetric(setMetrics)
  }, [form])

  /* 仅开发环境渲染 */
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production') {
    return null
  }

  const toggleExpanded = useCallback(() => {
    setExpanded(prev => !prev)
  }, [])

  const handleReset = useCallback(() => {
    if (!form) return
    const api = form.getPlugin<PerfMonitorAPI>('perf-monitor')
    api?.reset()
  }, [form])

  return (
    <div style={{
      position: 'fixed',
      bottom: 16,
      right: 16,
      zIndex: 9999,
      fontFamily: 'monospace',
      fontSize: 12,
    }}>
      {/* 折叠按钮 */}
      <button
        type="button"
        onClick={toggleExpanded}
        style={{
          display: 'block',
          marginLeft: 'auto',
          marginBottom: 4,
          padding: '4px 8px',
          background: '#1677ff',
          color: '#fff',
          border: 'none',
          borderRadius: 4,
          cursor: 'pointer',
          fontSize: 11,
        }}
      >
        {expanded ? '收起 DevTools' : '展开 DevTools'}
      </button>

      {/* 面板 */}
      {expanded && metrics && (
        <div style={{
          background: '#1a1a2e',
          color: '#e0e0e0',
          borderRadius: 8,
          padding: 12,
          minWidth: 240,
          boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontWeight: 700, color: '#1677ff' }}>ConfigForm DevTools</span>
            <button
              type="button"
              onClick={handleReset}
              style={{
                padding: '2px 6px',
                background: '#333',
                color: '#aaa',
                border: '1px solid #555',
                borderRadius: 3,
                cursor: 'pointer',
                fontSize: 10,
              }}
            >
              重置
            </button>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <MetricRow label="字段数" value={metrics.fieldCount} />
              <MetricRow label="联动次数" value={metrics.reactionCount} />
              <MetricRow label="验证次数" value={metrics.validateCount} />
              <MetricRow label="提交次数" value={metrics.submitCount} />
              <MetricRow label="验证耗时" value={`${metrics.lastValidateTime}ms`} warn={metrics.lastValidateTime > 100} />
              <MetricRow label="提交耗时" value={`${metrics.lastSubmitTime}ms`} warn={metrics.lastSubmitTime > 200} />
            </tbody>
          </table>

          {metrics.slowReactions.length > 0 && (
            <div style={{ marginTop: 8, borderTop: '1px solid #333', paddingTop: 8 }}>
              <div style={{ color: '#ff6b6b', fontWeight: 600, marginBottom: 4 }}>慢联动</div>
              {metrics.slowReactions.slice(0, 5).map((r, i) => (
                <div key={i} style={{ color: '#aaa', fontSize: 10, marginBottom: 2 }}>
                  {r.source} → {r.target}: {r.duration}ms
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function MetricRow({ label, value, warn = false }: { label: string, value: string | number, warn?: boolean }): ReactElement {
  return (
    <tr>
      <td style={{ padding: '3px 8px 3px 0', color: '#888' }}>{label}</td>
      <td style={{ padding: '3px 0', color: warn ? '#ff6b6b' : '#e0e0e0', fontWeight: 600, textAlign: 'right' }}>
        {value}
      </td>
    </tr>
  )
}
