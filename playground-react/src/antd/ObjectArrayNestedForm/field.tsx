/**
 * 对象数组嵌套（Field 版）
 *
 * 使用 FormProvider + FormArrayField + ArrayBase 实现嵌套数组。
 * 联系人数组 → 每人含嵌套电话数组。
 * ArrayBase 子组件自动根据 form.pattern 控制操作按钮显隐。
 */
import type { ArrayFieldInstance } from '@moluoxixi/core'
import React from 'react'
import { observer } from 'mobx-react-lite'
import { ArrayBase, FormArrayField, FormField, FormProvider, useCreateForm } from '@moluoxixi/react'
import { LayoutFormActions, StatusTabs, setupAntd } from '@moluoxixi/ui-antd'

setupAntd()

const CONTACT_TEMPLATE = { name: '', role: '', phones: [{ number: '', label: '手机' }] }
const PHONE_TEMPLATE = { number: '', label: '手机' }

export const ObjectArrayNestedForm = observer((): React.ReactElement => {
  const form = useCreateForm({
    initialValues: {
      teamName: '开发团队',
      contacts: [
        { name: '张三', role: '负责人', phones: [{ number: '13800138001', label: '手机' }] },
        { name: '李四', role: '成员', phones: [{ number: '13800138002', label: '手机' }, { number: '010-12345678', label: '座机' }] },
      ],
    },
  })

  return (
    <div>
      <h2>对象数组嵌套（Field 版）</h2>
      <p style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 16, fontSize: 14 }}>
        联系人数组 → 每人含嵌套电话数组 — FormArrayField + ArrayBase 实现
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
                <FormField name="teamName" fieldProps={{
                  label: '团队名称',
                  required: true,
                  component: 'Input',
                  componentProps: { placeholder: '请输入团队名称', style: { width: 300 } },
                }} />

                <FormArrayField
                  name="contacts"
                  fieldProps={{
                    minItems: 1,
                    maxItems: 10,
                    itemTemplate: () => ({ ...CONTACT_TEMPLATE }),
                  }}
                >
                  {(arrayField: ArrayFieldInstance) => {
                    const arrayValue = Array.isArray(arrayField.value) ? arrayField.value : []
                    return (
                      <ArrayBase>
                        <div style={{ marginBottom: 16 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <span style={{ fontWeight: 600 }}>团队成员 ({arrayValue.length}/10)</span>
                            <ArrayBase.Addition title="添加联系人" />
                          </div>

                          {arrayValue.map((_: unknown, idx: number) => (
                            <ArrayBase.Item key={idx} index={idx}>
                              <div style={{
                                border: '1px solid #f0f0f0',
                                borderRadius: 8,
                                padding: 12,
                                marginBottom: 8,
                                background: '#fafafa',
                              }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                  <span style={{ fontWeight: 600 }}>
                                    <ArrayBase.Index /> 联系人
                                  </span>
                                  <div style={{ display: 'flex', gap: 4 }}>
                                    <ArrayBase.MoveUp />
                                    <ArrayBase.MoveDown />
                                    <ArrayBase.Remove />
                                  </div>
                                </div>
                                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                                  <FormField name={`contacts.${idx}.name`} fieldProps={{ component: 'Input', componentProps: { placeholder: '姓名', size: 'small' } }} />
                                  <FormField name={`contacts.${idx}.role`} fieldProps={{ component: 'Input', componentProps: { placeholder: '角色', size: 'small' } }} />
                                </div>

                                {/* 嵌套电话数组 */}
                                <FormArrayField
                                  name={`contacts.${idx}.phones`}
                                  fieldProps={{ minItems: 1, maxItems: 5, itemTemplate: () => ({ ...PHONE_TEMPLATE }) }}
                                >
                                  {(phoneField: ArrayFieldInstance) => {
                                    const phones = Array.isArray(phoneField.value) ? phoneField.value : []
                                    return (
                                      <ArrayBase>
                                        <div style={{ padding: '8px 12px', background: '#fff', borderRadius: 4 }}>
                                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                            <span style={{ color: '#999', fontSize: 12 }}>电话列表 ({phones.length}/5)</span>
                                            <ArrayBase.Addition title="添加电话" />
                                          </div>
                                          {phones.map((__: unknown, pIdx: number) => (
                                            <ArrayBase.Item key={pIdx} index={pIdx}>
                                              <div style={{ display: 'flex', gap: 4, marginBottom: 4, alignItems: 'center' }}>
                                                <FormField name={`contacts.${idx}.phones.${pIdx}.label`} fieldProps={{ component: 'Input', componentProps: { placeholder: '标签', size: 'small', style: { width: 80 } } }} />
                                                <FormField name={`contacts.${idx}.phones.${pIdx}.number`} fieldProps={{ component: 'Input', componentProps: { placeholder: '号码', size: 'small', style: { width: 180 } } }} />
                                                <ArrayBase.Remove title="删" />
                                              </div>
                                            </ArrayBase.Item>
                                          ))}
                                        </div>
                                      </ArrayBase>
                                    )
                                  }}
                                </FormArrayField>
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
