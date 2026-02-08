/**
 * 场景 21：分步表单 (Field 版)
 *
 * 覆盖：
 * - Steps 组件导航
 * - 步骤验证（下一步前验证当前步骤）
 * - 最后一步预览汇总
 * - 三种模式切换
 *
 * FormField + fieldProps 实现，步骤切换通过条件渲染。
 */
import React, { useCallback, useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/react'
import { LayoutFormActions, StatusTabs, setupAntd } from '@moluoxixi/ui-antd'

setupAntd()

/** 步骤定义 */
const STEPS = [
  { title: '基本信息', fields: ['name', 'phone', 'email'] },
  { title: '工作信息', fields: ['company', 'position', 'salary'] },
  { title: '确认提交', fields: [] },
]

/**
 * 分步表单示例（Field 版）
 */
export const StepForm = observer((): React.ReactElement => {
  const [step, setStep] = useState(0)

  const form = useCreateForm({
    initialValues: { name: '', phone: '', email: '', company: '', position: '', salary: undefined as number | undefined },
  })

  useEffect(() => {
    form.createField({ name: 'name', label: '姓名', required: true, rules: [{ minLength: 2, message: '至少 2 字' }] })
    form.createField({ name: 'phone', label: '手机号', required: true, rules: [{ format: 'phone', message: '无效手机号' }] })
    form.createField({ name: 'email', label: '邮箱', required: true, rules: [{ format: 'email', message: '无效邮箱' }] })
    form.createField({ name: 'company', label: '公司', required: true })
    form.createField({ name: 'position', label: '职位', required: true })
    form.createField({ name: 'salary', label: '期望薪资', rules: [{ min: 0, message: '不能为负数' }] })
  }, [])

  /** 验证当前步骤 */
  const validateStep = useCallback(async (): Promise<boolean> => {
    const fields = STEPS[step].fields
    if (fields.length === 0) return true
    const results = await Promise.all(
      fields.map(async (name) => {
        const field = form.getField(name)
        return field ? field.validate('submit') : []
      }),
    )
    return results.flat().length === 0
  }, [step, form])

  /** 下一步 */
  const handleNext = useCallback(async (): Promise<void> => {
    if (!(await validateStep())) return
    setStep(s => Math.min(s + 1, STEPS.length - 1))
  }, [validateStep])

  const isLast = step === STEPS.length - 1

  return (
    <div>
      <h3>分步表单 (Field 版)</h3>
      <p style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 16, fontSize: 14 }}>Steps 导航 / 步骤验证 / 预览汇总 —— FormField + fieldProps 实现</p>

      <StatusTabs>
        {({ mode, showResult, showErrors }) => {
          form.pattern = mode
          return (
            <FormProvider form={form}>
                {/* 步骤条 */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                  {STEPS.map((s, i) => (
                    <div key={s.title} style={{ flex: 1, textAlign: 'center', padding: '8px 0', borderBottom: `2px solid ${i <= step ? '#1677ff' : '#d9d9d9'}`, color: i <= step ? '#1677ff' : '#999', fontSize: 14, fontWeight: i === step ? 600 : 400 }}>
                      {i + 1}. {s.title}
                    </div>
                  ))}
                </div>

                {/* Step 1：基本信息 */}
                {step === 0 && (
                  <div style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: 16, marginBottom: 16 }}>
                    <div style={{ fontWeight: 600, marginBottom: 12 }}>基本信息</div>
                    <FormField name="name" fieldProps={{ label: '姓名', required: true, component: 'Input', componentProps: { placeholder: '姓名' }, rules: [{ minLength: 2, message: '至少 2 字' }] }} />
                    <FormField name="phone" fieldProps={{ label: '手机号', required: true, component: 'Input', componentProps: { placeholder: '手机号' }, rules: [{ format: 'phone', message: '无效手机号' }] }} />
                    <FormField name="email" fieldProps={{ label: '邮箱', required: true, component: 'Input', componentProps: { placeholder: '邮箱' }, rules: [{ format: 'email', message: '无效邮箱' }] }} />
                  </div>
                )}

                {/* Step 2：工作信息 */}
                {step === 1 && (
                  <div style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: 16, marginBottom: 16 }}>
                    <div style={{ fontWeight: 600, marginBottom: 12 }}>工作信息</div>
                    <FormField name="company" fieldProps={{ label: '公司', required: true, component: 'Input', componentProps: { placeholder: '公司名称' } }} />
                    <FormField name="position" fieldProps={{ label: '职位', required: true, component: 'Input', componentProps: { placeholder: '职位' } }} />
                    <FormField name="salary" fieldProps={{ label: '期望薪资', component: 'InputNumber', componentProps: { placeholder: '期望薪资', min: 0, style: { width: '100%' } } }} />
                  </div>
                )}

                {/* Step 3：预览 */}
                {step === 2 && (
                  <div style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: 16, marginBottom: 16 }}>
                    <div style={{ fontWeight: 600, marginBottom: 12 }}>确认信息</div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <tbody>
                        <tr>
                          <td style={{ padding: '8px 12px', background: '#fafafa', border: '1px solid #f0f0f0', fontWeight: 500, width: '20%' }}>姓名</td>
                          <td style={{ padding: '8px 12px', border: '1px solid #f0f0f0', width: '30%' }}>{(form.getFieldValue('name') as string) || '—'}</td>
                          <td style={{ padding: '8px 12px', background: '#fafafa', border: '1px solid #f0f0f0', fontWeight: 500, width: '20%' }}>手机号</td>
                          <td style={{ padding: '8px 12px', border: '1px solid #f0f0f0', width: '30%' }}>{(form.getFieldValue('phone') as string) || '—'}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '8px 12px', background: '#fafafa', border: '1px solid #f0f0f0', fontWeight: 500 }}>邮箱</td>
                          <td style={{ padding: '8px 12px', border: '1px solid #f0f0f0' }}>{(form.getFieldValue('email') as string) || '—'}</td>
                          <td style={{ padding: '8px 12px', background: '#fafafa', border: '1px solid #f0f0f0', fontWeight: 500 }}>公司</td>
                          <td style={{ padding: '8px 12px', border: '1px solid #f0f0f0' }}>{(form.getFieldValue('company') as string) || '—'}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '8px 12px', background: '#fafafa', border: '1px solid #f0f0f0', fontWeight: 500 }}>职位</td>
                          <td style={{ padding: '8px 12px', border: '1px solid #f0f0f0' }}>{(form.getFieldValue('position') as string) || '—'}</td>
                          <td style={{ padding: '8px 12px', background: '#fafafa', border: '1px solid #f0f0f0', fontWeight: 500 }}>薪资</td>
                          <td style={{ padding: '8px 12px', border: '1px solid #f0f0f0' }}>{form.getFieldValue('salary') != null ? `¥${form.getFieldValue('salary')}` : '—'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
                  <div>{step > 0 && <button type="button" onClick={() => setStep(s => s - 1)} style={{ padding: '4px 15px', background: '#fff', border: '1px solid #d9d9d9', borderRadius: 6, cursor: 'pointer' }}>上一步</button>}</div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {!isLast && <button type="button" onClick={handleNext} style={{ padding: '4px 15px', background: '#1677ff', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>下一步</button>}
                  </div>
                </div>
                <LayoutFormActions onSubmit={showResult} onSubmitFailed={showErrors} />
            </FormProvider>
          )
        }}
      </StatusTabs>
    </div>
  )
})
