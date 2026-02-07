/**
 * 场景 25：动态增删字段 (Field 版)
 *
 * 覆盖：
 * - 运行时动态添加字段
 * - 运行时移除字段
 * - 动态字段参与验证和提交
 * - 三种模式切换
 *
 * FormField + fieldProps 实现，动态字段通过 form.createField 创建后用 fieldProps 渲染。
 */
import React, { useCallback, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/react'
import { LayoutFormActions, StatusTabs, setupAntd } from '@moluoxixi/ui-antd'
import { Button, Card, Input, Select, Space, Tag, Typography } from 'antd'

const { Title, Paragraph, Text } = Typography

setupAntd()

/** 可添加的字段类型 */
const FIELD_TYPE_OPTIONS = [
  { label: '文本', value: 'text' },
  { label: '数字', value: 'number' },
  { label: '选择', value: 'select' },
  { label: '开关', value: 'switch' },
]

/** 动态字段信息 */
interface DynamicFieldInfo {
  id: string
  name: string
  label: string
  fieldType: string
}

/** 类型到组件映射 */
const TYPE_COMPONENT_MAP: Record<string, string> = {
  text: 'Input',
  number: 'InputNumber',
  select: 'Select',
  switch: 'Switch',
}

/** 计数器 */
let fieldCounter = 0

/**
 * 动态增删字段示例（Field 版）
 */
export const DynamicFieldForm = observer((): React.ReactElement => {
  const [dynamicFields, setDynamicFields] = useState<DynamicFieldInfo[]>([])
  const [newFieldLabel, setNewFieldLabel] = useState('')
  const [newFieldType, setNewFieldType] = useState('text')

  const form = useCreateForm({ initialValues: { title: '' } })

  /** 添加字段 */
  const addField = useCallback((): void => {
    if (!newFieldLabel.trim()) return
    fieldCounter += 1
    const id = `dynamic_${fieldCounter}`
    const info: DynamicFieldInfo = { id, name: id, label: newFieldLabel.trim(), fieldType: newFieldType }
    setDynamicFields(prev => [...prev, info])
    setNewFieldLabel('')
  }, [newFieldLabel, newFieldType])

  /** 移除字段 */
  const removeField = useCallback((id: string): void => {
    form.removeField(id)
    setDynamicFields(prev => prev.filter(f => f.id !== id))
  }, [form])

  return (
    <div>
      <Title level={3}>动态增删字段 (Field 版)</Title>
      <Paragraph type="secondary">运行时添加 / 移除字段 / 动态字段参与验证提交 —— FormField + fieldProps 实现</Paragraph>

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
                {/* 添加字段面板 */}
                {mode === 'editable' && (
                  <Card size="small" title="添加新字段" style={{ marginBottom: 16 }}>
                    <Space>
                      <Input
                        value={newFieldLabel}
                        onChange={e => setNewFieldLabel(e.target.value)}
                        placeholder="字段标签"
                        style={{ width: 200 }}
                      />
                      <Select
                        value={newFieldType}
                        onChange={v => setNewFieldType(v)}
                        options={FIELD_TYPE_OPTIONS}
                        style={{ width: 120 }}
                      />
                      <Button type="primary" icon={<PlusOutlined />} onClick={addField} disabled={!newFieldLabel.trim()}>
                        添加
                      </Button>
                    </Space>
                    <div style={{ marginTop: 8 }}>
                      <Text type="secondary">
                        已添加
                        {dynamicFields.length}
                        {' '}
                        个动态字段
                      </Text>
                    </div>
                  </Card>
                )}

                {/* 固定字段：使用 fieldProps */}
                <FormField name="title" fieldProps={{
                  label: '表单标题',
                  required: true,
                  component: 'Input',
                  componentProps: { placeholder: '请输入表单标题' },
                }}
                />

                {/* 动态字段：使用 fieldProps */}
                {dynamicFields.map(df => (
                  <div key={df.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <div style={{ flex: 1 }}>
                      <FormField
                        name={df.name}
                        fieldProps={{
                          label: (
                            <Space>
                              {df.label}
                              <Tag color="blue" style={{ fontSize: 11 }}>{df.fieldType}</Tag>
                            </Space>
                          ) as any,
                          component: TYPE_COMPONENT_MAP[df.fieldType] ?? 'Input',
                          ...(df.fieldType === 'select'
                            ? {
                                dataSource: [
                                  { label: '选项 A', value: 'a' },
                                  { label: '选项 B', value: 'b' },
                                  { label: '选项 C', value: 'c' },
                                ],
                              }
                            : {}),
                          componentProps: {
                            placeholder: `请输入${df.label}`,
                            ...(df.fieldType === 'number' ? { style: { width: '100%' } } : {}),
                          },
                        }}
                      />
                    </div>
                    {mode === 'editable' && (
                      <Button danger icon={<DeleteOutlined />} style={{ marginTop: 4 }} onClick={() => removeField(df.id)} />
                    )}
                  </div>
                ))}
                {mode === 'editable' && <LayoutFormActions onReset={() => form.reset()} />}
              </form>
            </FormProvider>
          )
        }}
      </StatusTabs>
    </div>
  )
})
