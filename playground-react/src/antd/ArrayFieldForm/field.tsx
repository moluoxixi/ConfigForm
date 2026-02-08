/**
 * 数组字段（Field 版）
 *
 * 使用 FormProvider + FormArrayField + ArrayBase 实现数组字段增删排序。
 * ArrayBase 子组件自动根据 form.pattern 控制操作按钮显隐，
 * 无需手动判断 mode === 'editable'。
 */
import type { ArrayFieldInstance } from '@moluoxixi/core'
import React from 'react'
import { observer } from 'mobx-react-lite'
import { ArrayBase, FormArrayField, FormField, FormProvider, useCreateForm } from '@moluoxixi/react'
import { LayoutFormActions, StatusTabs, setupAntd } from '@moluoxixi/ui-antd'

setupAntd()

const MIN_ITEMS = 1
const MAX_ITEMS = 8
const CONTACT_TEMPLATE = { name: '', phone: '', email: '' }

export const ArrayFieldForm = observer((): React.ReactElement => {
  const form = useCreateForm({
    initialValues: {
      groupName: '默认分组',
      contacts: [{ ...CONTACT_TEMPLATE }],
    },
  })

  return (
    <div>
      <h2>数组字段（Field 版）</h2>
      <p style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 16, fontSize: 14 }}>
        增删 / 排序 / min={MIN_ITEMS} max={MAX_ITEMS} 数量限制 — FormArrayField + ArrayBase 实现
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
                <FormField name="groupName" fieldProps={{
                  label: '分组名称',
                  required: true,
                  component: 'Input',
                  componentProps: { placeholder: '请输入分组名称', style: { width: 300 } },
                }} />

                <FormArrayField
                  name="contacts"
                  fieldProps={{ minItems: MIN_ITEMS, maxItems: MAX_ITEMS, itemTemplate: () => ({ ...CONTACT_TEMPLATE }) }}
                >
                  {(arrayField: ArrayFieldInstance) => {
                    const arrayValue = Array.isArray(arrayField.value) ? arrayField.value : []
                    return (
                      <ArrayBase>
                        <div style={{ marginBottom: 16 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <span style={{ fontWeight: 600 }}>
                              联系人列表 ({arrayValue.length}/{MAX_ITEMS})
                            </span>
                            <ArrayBase.Addition title="添加联系人" />
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
                                <FormField name={`contacts.${idx}.name`} fieldProps={{ component: 'Input', componentProps: { placeholder: '姓名', size: 'small' } }} />
                                <FormField name={`contacts.${idx}.phone`} fieldProps={{ component: 'Input', componentProps: { placeholder: '电话', size: 'small' } }} />
                                <FormField name={`contacts.${idx}.email`} fieldProps={{ component: 'Input', componentProps: { placeholder: '邮箱', size: 'small' } }} />
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
