import { FormField, FormProvider, useCreateForm } from '@moluoxixi/react'
import { LayoutFormActions, StatusTabs, setupAntd } from '@moluoxixi/ui-antd'
import { observer } from 'mobx-react-lite'
/**
 * 场景 41：多表单协作
 *
 * 覆盖：
 * - 两个独立表单联合提交
 * - 跨表单值联动
 * - 弹窗表单（Modal）
 * - 三种模式切换
 *
 * 主表单（订单）和子表单（联系人）各自使用 FormProvider + FormField + fieldProps。
 * 弹窗表单复用 subForm 实例。
 */
import React, { useState } from 'react'

setupAntd()

/** 子表单字段名列表 */
const SUB_FIELDS = ['contactName', 'contactPhone', 'contactEmail']

/** 子表单字段 fieldProps 配置 */
function getSubFieldProps(name: string): Record<string, unknown> {
  const defs: Record<string, Record<string, unknown>> = {
    contactName: { label: '联系人', required: true, component: 'Input' },
    contactPhone: { label: '联系电话', required: true, component: 'Input', rules: [{ format: 'phone', message: '无效手机号' }] },
    contactEmail: { label: '邮箱', component: 'Input', rules: [{ format: 'email', message: '无效邮箱' }] },
  }
  return defs[name] ?? { component: 'Input' }
}

export const MultiFormForm = observer((): React.ReactElement => {
  const [modalOpen, setModalOpen] = useState(false)

  /* 主表单 */
  const mainForm = useCreateForm({ initialValues: { orderName: '', customer: '', total: 0 } })

  /* 子表单（弹窗内 + 右侧卡片） */
  const subForm = useCreateForm({ initialValues: { contactName: '', contactPhone: '', contactEmail: '' } })

  /** 弹窗确认：校验子表单并同步客户名到主表单 */
  const handleModalOk = async (): Promise<void> => {
    const res = await subForm.submit()
    if (res.errors.length > 0) return
    mainForm.setFieldValue('customer', subForm.getFieldValue('contactName') as string)
    setModalOpen(false)
  }

  return (
    <div>
      <h3>多表单协作</h3>
      <p style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 16, fontSize: 14 }}>两个独立表单 / 联合提交 / 跨表单值联动 / 弹窗表单</p>

      <StatusTabs>
        {({ mode, showResult, showErrors }) => {
          mainForm.pattern = mode
          subForm.pattern = mode
          return (
            <FormProvider form={mainForm}>
              <form onSubmit={async (e: React.FormEvent) => {
                e.preventDefault()
                const res = await mainForm.submit()
                if (res.errors.length > 0) showErrors(res.errors)
                else showResult(res.values)
              }} noValidate>
                <div style={{ display: 'flex', gap: 16 }}>
                  {/* 左侧：主表单 */}
                  <div style={{ flex: 1 }}>
                    <div style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: 16, marginBottom: 16 }}>
                      <div style={{ fontWeight: 600, marginBottom: 12 }}>主表单 - 订单信息</div>
                      <FormField name="orderName" fieldProps={{ label: '订单名称', required: true, component: 'Input' }} />
                      <FormField name="customer" fieldProps={{ label: '客户名称', required: true, component: 'Input' }} />
                      <FormField name="total" fieldProps={{ label: '订单金额', required: true, component: 'InputNumber', componentProps: { min: 0, style: { width: '100%' } } }} />
                      {(
                        <button type="button" onClick={() => setModalOpen(true)} style={{ padding: '4px 15px', background: '#fff', border: '1px dashed #d9d9d9', borderRadius: 6, cursor: 'pointer' }}>从弹窗填写联系人</button>
                      )}
                    </div>
                  </div>

                  {/* 右侧：子表单 */}
                  <div style={{ flex: 1 }}>
                    <div style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: 16, marginBottom: 16 }}>
                      <div style={{ fontWeight: 600, marginBottom: 12 }}>子表单 - 联系人信息</div>
                      <FormProvider form={subForm}>
                        {SUB_FIELDS.map(name => (
                          <FormField key={name} name={name} fieldProps={getSubFieldProps(name)} />
                        ))}
                      </FormProvider>
                    </div>
                  </div>
                </div>
                {<LayoutFormActions onReset={() => mainForm.reset()} />}
              </form>
            </FormProvider>
          )
        }}
      </StatusTabs>

      {/* 弹窗表单（编辑联系人） */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.45)' }}>
          <div style={{ background: '#fff', borderRadius: 8, padding: 24, minWidth: 420, maxWidth: '90vw', boxShadow: '0 6px 16px rgba(0,0,0,0.08)' }}>
            <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 16 }}>编辑联系人</div>
            <FormProvider form={subForm}>
              {SUB_FIELDS.map(name => (
                <FormField key={name} name={name} fieldProps={getSubFieldProps(name)} />
              ))}
            </FormProvider>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
              <button type="button" onClick={() => setModalOpen(false)} style={{ padding: '4px 15px', background: '#fff', border: '1px solid #d9d9d9', borderRadius: 6, cursor: 'pointer' }}>取消</button>
              <button type="button" onClick={handleModalOk} style={{ padding: '4px 15px', background: '#1677ff', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>确定</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
})
