/**
 * 动态增删字段（Field 版）
 *
 * 使用 FormProvider + FormArrayField 管理动态字段。
 * 每个数组项包含 label、value、type 三个子字段，
 * 增删操作由 FormArrayField（ArrayBase）自动处理。
 * 框架根据 form.pattern 自动控制操作按钮显隐。
 */
import type { ArrayFieldInstance } from '@moluoxixi/core'
import React from 'react'
import { observer } from 'mobx-react-lite'
import { ArrayBase, FormArrayField, FormField, FormProvider, useCreateForm } from '@moluoxixi/react'
import { LayoutFormActions, StatusTabs, setupAntd } from '@moluoxixi/ui-antd'

setupAntd()

export const DynamicFieldForm = observer((): React.ReactElement => {
  const form = useCreateForm({
    initialValues: {
      title: '',
      dynamicItems: [{ label: '姓名', value: '', type: 'text' }],
    },
  })

  return (
    <div>
      <h2>动态增删字段（Field 版）</h2>
      <p style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 16, fontSize: 14 }}>
        运行时添加/移除字段 — FormArrayField + ArrayBase 实现
      </p>

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
                <FormField name="title" fieldProps={{
                  label: '表单标题',
                  required: true,
                  component: 'Input',
                  componentProps: { placeholder: '请输入标题' },
                }} />

                <FormArrayField
                  name="dynamicItems"
                  fieldProps={{
                    minItems: 0,
                    maxItems: 20,
                    itemTemplate: () => ({ label: '', value: '', type: 'text' }),
                  }}
                >
                  {(arrayField: ArrayFieldInstance) => {
                    const arrayValue = Array.isArray(arrayField.value) ? arrayField.value : []
                    return (
                      <ArrayBase>
                        <div style={{ marginBottom: 16 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <span style={{ fontWeight: 600 }}>动态字段 ({arrayValue.length}/20)</span>
                            <ArrayBase.Addition title="添加字段" />
                          </div>

                          {arrayValue.map((_: unknown, idx: number) => (
                            <ArrayBase.Item key={idx} index={idx}>
                              <div style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 8,
                                padding: '8px 12px',
                                background: idx % 2 === 0 ? '#fafafa' : '#fff',
                                borderRadius: 4,
                                marginBottom: 4,
                              }}>
                                <ArrayBase.Index />
                                <FormField name={`dynamicItems.${idx}.label`} fieldProps={{ component: 'Input', componentProps: { placeholder: '标签', size: 'small' } }} />
                                <FormField name={`dynamicItems.${idx}.value`} fieldProps={{ component: 'Input', componentProps: { placeholder: '值', size: 'small' } }} />
                                <FormField name={`dynamicItems.${idx}.type`} fieldProps={{ component: 'Input', componentProps: { placeholder: '类型', size: 'small' } }} />
                                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                                  <ArrayBase.MoveUp />
                                  <ArrayBase.MoveDown />
                                  <ArrayBase.Remove />
                                </div>
                              </div>
                            </ArrayBase.Item>
                          ))}
                        </div>
                      </ArrayBase>
                    )
                  }}
                </FormArrayField>
                <LayoutFormActions onReset={() => form.reset()} />
              </form>
            </FormProvider>
          )
        }}
      </StatusTabs>
    </div>
  )
})
