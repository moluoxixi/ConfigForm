import type { FieldInstance } from '@moluoxixi/core'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/react'
import { setupAntd, StatusTabs } from '@moluoxixi/ui-antd'
import { observer } from 'mobx-react-lite'
/**
 * 场景 21：分步表单
 *
 * 覆盖：
 * - Steps 组件导航
 * - 步骤验证（下一步前验证当前步骤）
 * - 最后一步预览汇总
 * - 提交前拦截（Modal.confirm）
 * - 三种模式切换
 */
import React, { useEffect, useState } from 'react'

setupAntd()

/** 步骤定义 */
const STEPS = [
  { title: '基本信息', fields: ['name', 'phone', 'email'] },
  { title: '工作信息', fields: ['company', 'position', 'salary'] },
  { title: '确认提交', fields: [] },
]

/**
 * 分步表单示例
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
  const validateStep = async (): Promise<boolean> => {
    const fields = STEPS[step].fields
    if (fields.length === 0)
      return true
    const results = await Promise.all(
      fields.map(async (name) => {
        const field = form.getField(name)
        return field ? field.validate('submit') : []
      }),
    )
    return results.flat().length === 0
  }

  /** 下一步 */
  const handleNext = async (): Promise<void> => {
    if (!(await validateStep()))
      return
    setStep(s => Math.min(s + 1, STEPS.length - 1))
  }

  const isLast = step === STEPS.length - 1

  /** 渲染文本字段 */
  const renderInput = (field: FieldInstance, placeholder: string, mode: string): React.ReactElement => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', marginBottom: 4, fontWeight: 500, fontSize: 13 }}>
        {field.label}
        {' '}
        {field.required && <span style={{ color: 'red' }}>*</span>}
      </label>
      {isLast
        ? (
            <span>{(field.value as string) || '—'}</span>
          )
        : (
            <input
              value={(field.value as string) ?? ''}
              onChange={e => field.setValue(e.target.value)}
              onBlur={() => {
                field.blur()
                field.validate('blur').catch(() => {})
              }}
              placeholder={placeholder}
              disabled={mode === 'disabled'}
              readOnly={mode === 'readOnly'}
              
            />
          )}
      {field.errors.length > 0 && <div style={{ color: '#ff4d4f', fontSize: 12, marginTop: 4 }}>{field.errors[0].message}</div>}
    </div>
  )

  return (
    <div>
      <h2>分步表单</h2>
      <p style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 16, fontSize: 14 }}>Steps 导航 / 步骤验证 / 预览汇总 / Modal.confirm 拦截</p>

      <StatusTabs>
        {({ mode }) => {
          form.pattern = mode
          return (
            <FormProvider form={form}>
              <>
                <div style={{ display: 'flex', marginBottom: 24 }}>
                {STEPS.map((s, i) => (
                  <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: i <= step ? '#1677ff' : '#f0f0f0', color: i <= step ? '#fff' : '#999', fontSize: 14, fontWeight: 600 }}>{i + 1}</div>
                    <div style={{ fontSize: 13, marginTop: 4, color: i <= step ? '#000' : '#999' }}>{s.title}</div>
                  </div>
                ))}
              </div>

                {/* Step 1 */}
                {step === 0 && (
                  <div style={{ border: '1px solid #f0f0f0', borderRadius: 8 }}><div style={{ padding: '8px 16px', borderBottom: '1px solid #f0f0f0', fontWeight: 500 }}>基本信息</div><div style={{ padding: 16 }}>
                    <Row gutter={24}>
                      <Col span={12}><FormField name="name">{(f: FieldInstance) => renderInput(f, '姓名', mode)}</FormField></Col>
                      <Col span={12}><FormField name="phone">{(f: FieldInstance) => renderInput(f, '手机号', mode)}</FormField></Col>
                      <Col span={12}><FormField name="email">{(f: FieldInstance) => renderInput(f, '邮箱', mode)}</FormField></Col>
                    </Row>
                  </div></div>
                )}

                {/* Step 2 */}
                {step === 1 && (
                  <div style={{ border: '1px solid #f0f0f0', borderRadius: 8 }}><div style={{ padding: '8px 16px', borderBottom: '1px solid #f0f0f0', fontWeight: 500 }}>工作信息</div><div style={{ padding: 16 }}>
                    <Row gutter={24}>
                      <Col span={12}><FormField name="company">{(f: FieldInstance) => renderInput(f, '公司名称', mode)}</FormField></Col>
                      <Col span={12}><FormField name="position">{(f: FieldInstance) => renderInput(f, '职位', mode)}</FormField></Col>
                      <Col span={12}>
                        <FormField name="salary">
                          {(f: FieldInstance) => (
                            <div style={{ marginBottom: 16 }}>
                              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500, fontSize: 13 }}>{f.label}</label>
                              <input type="number"
                                value={f.value as number}
                                onChange={v => f.setValue(v)}
                                placeholder="期望薪资"
                                min={0}
                                style={{ width: '100%' }}
                                disabled={mode === 'disabled'}
                                readOnly={mode === 'readOnly'}
                              />
                            </div>
                          )}
                        </FormField>
                      </Col>
                    </Row>
                  </div></div>
                )}

                {/* Step 3：预览 */}
                {step === 2 && (
                  <div style={{ border: '1px solid #f0f0f0', borderRadius: 8 }}><div style={{ padding: '8px 16px', borderBottom: '1px solid #f0f0f0', fontWeight: 500 }}>确认信息</div><div style={{ padding: 16 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #f0f0f0' }}><tbody>
                      <tr style={{ borderBottom: '1px solid #f0f0f0' }}><td style={{ padding: '8px 16px', background: '#fafafa', fontWeight: 500, width: 120 }}>姓名</td><td style={{ padding: '8px 16px' }}>{(form.getFieldValue('name') as string) || '—'}</td></tr>
                      <tr style={{ borderBottom: '1px solid #f0f0f0' }}><td style={{ padding: '8px 16px', background: '#fafafa', fontWeight: 500, width: 120 }}>手机号</td><td style={{ padding: '8px 16px' }}>{(form.getFieldValue('phone') as string) || '—'}</td></tr>
                      <tr style={{ borderBottom: '1px solid #f0f0f0' }}><td style={{ padding: '8px 16px', background: '#fafafa', fontWeight: 500, width: 120 }}>邮箱</td><td style={{ padding: '8px 16px' }}>{(form.getFieldValue('email') as string) || '—'}</td></tr>
                      <tr style={{ borderBottom: '1px solid #f0f0f0' }}><td style={{ padding: '8px 16px', background: '#fafafa', fontWeight: 500, width: 120 }}>公司</td><td style={{ padding: '8px 16px' }}>{(form.getFieldValue('company') as string) || '—'}</td></tr>
                      <tr style={{ borderBottom: '1px solid #f0f0f0' }}><td style={{ padding: '8px 16px', background: '#fafafa', fontWeight: 500, width: 120 }}>职位</td><td style={{ padding: '8px 16px' }}>{(form.getFieldValue('position') as string) || '—'}</td></tr>
                      <tr style={{ borderBottom: '1px solid #f0f0f0' }}><td style={{ padding: '8px 16px', background: '#fafafa', fontWeight: 500, width: 120 }}>薪资</td><td style={{ padding: '8px 16px' }}>{form.getFieldValue('salary') != null ? `¥${form.getFieldValue('salary')}` : '—'}</td></tr>
                    </tbody></table>
                  </div></div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
                  <div>{step > 0 && <button style={{ padding: '4px 12px', fontSize: 14, background: '#fff', border: '1px solid #d9d9d9', borderRadius: 6, cursor: 'pointer' }} onClick={() => setStep(s => s - 1)}>上一步</button>}</div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {!isLast && (
                      <button style={{ padding: '4px 12px', fontSize: 14, background: '#1677ff', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }} onClick={handleNext}>下一步</button>
                    )}
                  </div>
                </div>
              </>
            </FormProvider>
          )
        }}
      </StatusTabs>
    </div>
  )
})
