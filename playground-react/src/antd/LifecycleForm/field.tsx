import { FormField, FormProvider, useCreateForm } from '@moluoxixi/react'
import { LayoutFormActions, StatusTabs, setupAntd } from '@moluoxixi/ui-antd'
import {
  Badge,
  Button,
  Card,
  Space,
  Switch,
  Tag,
  Typography,
} from 'antd'
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

const { Title, Paragraph, Text } = Typography

setupAntd()

/** 自动保存防抖时间（ms） */
const AUTO_SAVE_DELAY = 1500

/** 最大日志条数 */
const MAX_LOGS = 50

/** 日志类型颜色映射 */
const TYPE_COLORS: Record<string, string> = {
  'mount': 'purple',
  'change': 'blue',
  'submit': 'green',
  'reset': 'orange',
  'auto-save': 'cyan',
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
      <Title level={3}>生命周期钩子</Title>
      <Paragraph type="secondary">
        onMount / onChange / onSubmit / onReset / 自动保存（
        {AUTO_SAVE_DELAY}
        ms 防抖）
      </Paragraph>

      <div style={{ display: 'flex', gap: 16 }}>
        {/* 左侧：表单区域 */}
        <div style={{ flex: 1 }}>
          {/* 自动保存开关（附加内容） */}
          <Space style={{ marginBottom: 12 }}>
            <Text>自动保存：</Text>
            <Switch checked={autoSave} onChange={v => setAutoSave(v)} />
          </Space>

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
                    <FormField name="title" fieldProps={{ label: '标题', required: true, component: 'Input' }} />
                    <FormField name="price" fieldProps={{ label: '价格', component: 'InputNumber', componentProps: { style: { width: '100%' } } }} />
                    <FormField name="description" fieldProps={{ label: '描述', component: 'Textarea', componentProps: { rows: 3 } }} />
                    {mode === 'editable' && <LayoutFormActions onReset={() => form.reset()} />}
                  </form>
                </FormProvider>
              )
            }}
          </StatusTabs>
        </div>

        {/* 右侧：事件日志面板（附加内容） */}
        <Card
          title={(
            <span>
              事件日志
              <Badge count={logs.length} />
            </span>
          )}
          size="small"
          style={{ width: 360 }}
          extra={<Button size="small" onClick={() => setLogs([])}>清空</Button>}
        >
          <div style={{ maxHeight: 400, overflow: 'auto', fontSize: 12 }}>
            {logs.map(log => (
              <div key={log.id} style={{ padding: '2px 0', borderBottom: '1px solid #f0f0f0' }}>
                <Tag color={TYPE_COLORS[log.type] ?? 'default'} style={{ fontSize: 10 }}>{log.type}</Tag>
                <Text type="secondary">{log.time}</Text>
                <div style={{ color: '#555', marginTop: 2 }}>{log.message}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
})
