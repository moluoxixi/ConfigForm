import type { FieldInstance } from '@moluoxixi/core'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/react'
import { setupAntd, StatusTabs } from '@moluoxixi/ui-antd'
import { Alert, Form, Input, Select, Space, Typography } from 'antd'
import { observer } from 'mobx-react-lite'
/**
 * 场景 32：代码编辑器
 *
 * 覆盖：
 * - 代码编辑器集成（Textarea 模拟，实际接入 @monaco-editor/react）
 * - 语言选择
 * - 语法高亮预览
 * - 三种模式切换
 */
import React, { useEffect } from 'react'

const { Title, Paragraph } = Typography

setupAntd()

const LANGUAGES = [
  { label: 'JavaScript', value: 'javascript' },
  { label: 'TypeScript', value: 'typescript' },
  { label: 'Python', value: 'python' },
  { label: 'JSON', value: 'json' },
  { label: 'HTML', value: 'html' },
  { label: 'CSS', value: 'css' },
]

const DEFAULT_CODE = `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10));`

export const CodeEditorForm = observer((): React.ReactElement => {
  const form = useCreateForm({
    initialValues: { title: '代码片段', language: 'javascript', code: DEFAULT_CODE },
  })

  useEffect(() => {
    form.createField({ name: 'title', label: '标题', required: true })
    form.createField({ name: 'language', label: '语言' })
    form.createField({ name: 'code', label: '代码', required: true })
  }, [])

  return (
    <div>
      <Title level={3}>代码编辑器</Title>
      <Paragraph type="secondary">Textarea 模拟（可接入 @monaco-editor/react） / 语言选择 / 三种模式</Paragraph>
      <Alert type="info" showIcon style={{ marginBottom: 16 }} message="此为简化版，实际项目请安装 @monaco-editor/react 获得语法高亮、自动补全等功能。" />
      <StatusTabs>
        {({ mode }) => {
          form.pattern = mode
          return (
            <FormProvider form={form}>
              <Space style={{ marginBottom: 16 }}>
                <FormField name="title">
                  {(field: FieldInstance) => (
                    <Form.Item label={field.label} style={{ marginBottom: 0 }}>
                      <Input value={(field.value as string) ?? ''} onChange={e => field.setValue(e.target.value)} disabled={mode === 'disabled'} readOnly={mode === 'readOnly'} style={{ width: 250 }} />
                    </Form.Item>
                  )}
                </FormField>
                <FormField name="language">
                  {(field: FieldInstance) => (
                    <Form.Item label={field.label} style={{ marginBottom: 0 }}>
                      <Select value={(field.value as string) ?? 'javascript'} onChange={v => field.setValue(v)} options={LANGUAGES} disabled={mode === 'disabled'} style={{ width: 160 }} />
                    </Form.Item>
                  )}
                </FormField>
              </Space>

              <FormField name="code">
                {(field: FieldInstance) => (
                  <Form.Item label={field.label} required={field.required}>
                    {mode === 'editable'
                      ? (
                          <Input.TextArea
                            value={(field.value as string) ?? ''}
                            onChange={e => field.setValue(e.target.value)}
                            rows={12}
                            style={{ fontFamily: 'Consolas, Monaco, monospace', fontSize: 13, background: '#1e1e1e', color: '#d4d4d4' }}
                          />
                        )
                      : (
                          <pre style={{ padding: 16, borderRadius: 8, background: '#1e1e1e', color: '#d4d4d4', fontFamily: 'Consolas, Monaco, monospace', fontSize: 13, overflow: 'auto', maxHeight: 400, opacity: mode === 'disabled' ? 0.6 : 1 }}>
                            {(field.value as string) || '// 暂无代码'}
                          </pre>
                        )}
                  </Form.Item>
                )}
              </FormField>
            </FormProvider>
          )
        }}
      </StatusTabs>
    </div>
  )
})
