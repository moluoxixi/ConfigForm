import type { FieldInstance } from '@moluoxixi/core'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/react'
import { setupAntd, StatusTabs } from '@moluoxixi/ui-antd'
import {
  Badge,
  Button,
  Card,
  Form,
  Input,
  InputNumber,
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
 */
import React, { useCallback, useEffect, useRef, useState } from 'react'

const { Title, Paragraph, Text } = Typography

setupAntd()

const FIELDS = ['title', 'price', 'description']

/** 自动保存防抖时间（ms） */
const AUTO_SAVE_DELAY = 1500

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
    setLogs(prev => [{ id: logId, time: new Date().toLocaleTimeString(), type, message: msg }, ...prev].slice(0, 50))
  }, [])

  useEffect(() => {
    form.createField({ name: 'title', label: '标题', required: true })
    form.createField({ name: 'price', label: '价格' })
    form.createField({ name: 'description', label: '描述' })

    /* onMount */
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
          catch { /* ignore */ }
        }, AUTO_SAVE_DELAY)
      }
    })

    return () => {
      unsub()
      if (timerRef.current)
        clearTimeout(timerRef.current)
    }
  }, [autoSave])

  const typeColors: Record<string, string> = { 'mount': 'purple', 'change': 'blue', 'submit': 'green', 'reset': 'orange', 'auto-save': 'cyan' }

  return (
    <div>
      <Title level={3}>生命周期钩子</Title>
      <Paragraph type="secondary">
        onMount / onChange / onSubmit / onReset / 自动保存（
        {AUTO_SAVE_DELAY}
        ms 防抖）
      </Paragraph>

      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <Space style={{ marginBottom: 12 }}>
            <Text>自动保存：</Text>
            <Switch checked={autoSave} onChange={v => setAutoSave(v)} />
          </Space>

          <StatusTabs>
            {({ mode }) => {
              form.pattern = mode
              return (
                <FormProvider form={form}>
                  {FIELDS.map(name => (
                    <FormField key={name} name={name}>
                      {(field: FieldInstance) => (
                        <Form.Item label={field.label} required={field.required}>
                          {name === 'price'
                            ? (
                                <InputNumber value={field.value as number} onChange={v => field.setValue(v)} disabled={mode === 'disabled'} readOnly={mode === 'readOnly'} style={{ width: '100%' }} />
                              )
                            : name === 'description'
                              ? (
                                  <Input.TextArea value={(field.value as string) ?? ''} onChange={e => field.setValue(e.target.value)} disabled={mode === 'disabled'} readOnly={mode === 'readOnly'} rows={3} />
                                )
                              : (
                                  <Input value={(field.value as string) ?? ''} onChange={e => field.setValue(e.target.value)} disabled={mode === 'disabled'} readOnly={mode === 'readOnly'} />
                                )}
                        </Form.Item>
                      )}
                    </FormField>
                  ))}
                </FormProvider>
              )
            }}
          </StatusTabs>
        </div>

        {/* 事件日志面板 */}
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
                <Tag color={typeColors[log.type] ?? 'default'} style={{ fontSize: 10 }}>{log.type}</Tag>
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
