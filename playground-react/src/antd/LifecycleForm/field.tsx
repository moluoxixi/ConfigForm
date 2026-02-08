import { FormField, FormProvider, useCreateForm } from '@moluoxixi/react'
import { LayoutFormActions, StatusTabs, setupAntd } from '@moluoxixi/ui-antd'
import { observer } from 'mobx-react-lite'
/**
 * 场景 44：生命周期钩子
 *
 * 覆盖：
 * - onMount：表单挂载
 * - onChange：值变化监听
 * - onSubmit：提交拦截
 * - onReset：重置拦截
 * - 自动保存（防抖）
 * - 事件日志面板
 * - 三种模式切换
 *
 * 所有字段使用 FormField + fieldProps。事件日志和自动保存作为附加内容。
 */
import React, { useCallback, useEffect, useRef, useState } from 'react'

setupAntd()

/** 自动保存防抖时间（ms） */
const AUTO_SAVE_DELAY = 1500

/** 最大日志条数 */
const MAX_LOGS = 50

/** 日志类型颜色映射（background 色 + 文字色） */
const TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  'mount': { bg: '#f9f0ff', color: '#722ed1' },
  'change': { bg: '#e6f4ff', color: '#1677ff' },
  'submit': { bg: '#f6ffed', color: '#52c41a' },
  'reset': { bg: '#fff7e6', color: '#fa8c16' },
  'auto-save': { bg: '#e6fffb', color: '#13c2c2' },
}

/** 事件日志条目 */
interface LogEntry {
  id: number
  time: string
  type: 'mount' | 'change' | 'submit' | 'reset' | 'auto-save'
  message: string
}

let logId = 0

export const LifecycleForm = observer((): React.ReactElement => {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [autoSave, setAutoSave] = useState(true)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const form = useCreateForm({
    initialValues: { title: '生命周期测试', price: 99, description: '' },
  })

  /** 添加日志 */
  const addLog = useCallback((type: LogEntry['type'], msg: string): void => {
    logId += 1
    setLogs(prev => [{ id: logId, time: new Date().toLocaleTimeString(), type, message: msg }, ...prev].slice(0, MAX_LOGS))
  }, [])

  /** 订阅生命周期事件：onMount + onChange + 自动保存 */
  useEffect(() => {
    addLog('mount', '表单已挂载')

    /* onChange：监听值变化 */
    const unsub = form.onValuesChange((values: Record<string, unknown>) => {
      addLog('change', `值变化：${JSON.stringify(values).slice(0, 80)}...`)

      /* 自动保存（防抖） */
      if (timerRef.current)
        clearTimeout(timerRef.current)
      if (autoSave) {
        timerRef.current = setTimeout(() => {
          addLog('auto-save', '自动保存到 localStorage')
          try {
            localStorage.setItem('lifecycle-form-auto', JSON.stringify(values))
          }
          catch { /* 存储失败忽略 */ }
        }, AUTO_SAVE_DELAY)
      }
    })

    return () => {
      unsub()
      if (timerRef.current)
        clearTimeout(timerRef.current)
    }
  }, [autoSave]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <h3>生命周期钩子</h3>
      <p style={{ color: '#666' }}>
        onMount / onChange / onSubmit / onReset / 自动保存（
        {AUTO_SAVE_DELAY}
        ms 防抖）
      </p>

      <div style={{ display: 'flex', gap: 16 }}>
        {/* 左侧：表单区域 */}
        <div style={{ flex: 1 }}>
          {/* 自动保存开关（附加内容） */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
            <span>自动保存：</span>
            <label style={{ position: 'relative', display: 'inline-block', width: 44, height: 22 }}>
              <input type="checkbox" checked={autoSave} onChange={e => setAutoSave(e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
              <span style={{ position: 'absolute', cursor: 'pointer', inset: 0, background: autoSave ? '#1677ff' : '#ccc', borderRadius: 22, transition: 'background .3s' }}>
                <span style={{ position: 'absolute', left: autoSave ? 24 : 2, top: 2, width: 18, height: 18, background: '#fff', borderRadius: '50%', transition: 'left .3s' }} />
              </span>
            </label>
          </div>

          <StatusTabs>
            {({ mode, showResult, showErrors }) => {
              form.pattern = mode
              return (
                <FormProvider form={form}>
                    <FormField name="title" fieldProps={{ label: '标题', required: true, component: 'Input' }} />
                    <FormField name="price" fieldProps={{ label: '价格', component: 'InputNumber', componentProps: { style: { width: '100%' } } }} />
                    <FormField name="description" fieldProps={{ label: '描述', component: 'Textarea', componentProps: { rows: 3 } }} />
                    <LayoutFormActions onSubmit={showResult} onSubmitFailed={showErrors} />
                </FormProvider>
              )
            }}
          </StatusTabs>
        </div>

        {/* 右侧：事件日志面板（附加内容） */}
        <div style={{ width: 360, border: '1px solid #f0f0f0', borderRadius: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderBottom: '1px solid #f0f0f0' }}>
            <span style={{ fontWeight: 500 }}>
              事件日志
              {logs.length > 0 && (
                <span style={{ display: 'inline-block', minWidth: 20, height: 20, lineHeight: '20px', textAlign: 'center', fontSize: 12, background: '#ff4d4f', color: '#fff', borderRadius: 10, marginLeft: 6, padding: '0 6px' }}>
                  {logs.length}
                </span>
              )}
            </span>
            <button type="button" onClick={() => setLogs([])} style={{ padding: '2px 8px', fontSize: 12, borderRadius: 4, border: '1px solid #d9d9d9', background: '#fff', cursor: 'pointer' }}>清空</button>
          </div>
          <div style={{ maxHeight: 400, overflow: 'auto', fontSize: 12, padding: '0 12px' }}>
            {logs.map(log => {
              const typeColor = TYPE_COLORS[log.type] ?? { bg: '#f0f0f0', color: '#666' }
              return (
                <div key={log.id} style={{ padding: '2px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <span style={{ display: 'inline-block', padding: '0 7px', fontSize: 10, lineHeight: '20px', background: typeColor.bg, color: typeColor.color, border: `1px solid ${typeColor.color}33`, borderRadius: 4 }}>{log.type}</span>
                  <span style={{ color: '#999', marginLeft: 4 }}>{log.time}</span>
                  <div style={{ color: '#555', marginTop: 2 }}>{log.message}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
})
