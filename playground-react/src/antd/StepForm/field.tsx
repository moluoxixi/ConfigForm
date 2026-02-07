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
import { Button, Card, Descriptions, Space, Steps, Typography } from 'antd'

const { Title, Paragraph } = Typography

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
      <Title level={3}>分步表单 (Field 版)</Title>
      <Paragraph type="secondary">Steps 导航 / 步骤验证 / 预览汇总 —— FormField + fieldProps 实现</Paragraph>

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
                <Steps current={step} items={STEPS.map(s => ({ title: s.title }))} style={{ marginBottom: 24 }} />

                {/* Step 1：基本信息 */}
                {step === 0 && (
                  <Card title="基本信息">
                    <FormField name="name" fieldProps={{ label: '姓名', required: true, component: 'Input', componentProps: { placeholder: '姓名' }, rules: [{ minLength: 2, message: '至少 2 字' }] }} />
                    <FormField name="phone" fieldProps={{ label: '手机号', required: true, component: 'Input', componentProps: { placeholder: '手机号' }, rules: [{ format: 'phone', message: '无效手机号' }] }} />
                    <FormField name="email" fieldProps={{ label: '邮箱', required: true, component: 'Input', componentProps: { placeholder: '邮箱' }, rules: [{ format: 'email', message: '无效邮箱' }] }} />
                  </Card>
                )}

                {/* Step 2：工作信息 */}
                {step === 1 && (
                  <Card title="工作信息">
                    <FormField name="company" fieldProps={{ label: '公司', required: true, component: 'Input', componentProps: { placeholder: '公司名称' } }} />
                    <FormField name="position" fieldProps={{ label: '职位', required: true, component: 'Input', componentProps: { placeholder: '职位' } }} />
                    <FormField name="salary" fieldProps={{ label: '期望薪资', component: 'InputNumber', componentProps: { placeholder: '期望薪资', min: 0, style: { width: '100%' } } }} />
                  </Card>
                )}

                {/* Step 3：预览 */}
                {step === 2 && (
                  <Card title="确认信息">
                    <Descriptions bordered column={2}>
                      <Descriptions.Item label="姓名">{(form.getFieldValue('name') as string) || '—'}</Descriptions.Item>
                      <Descriptions.Item label="手机号">{(form.getFieldValue('phone') as string) || '—'}</Descriptions.Item>
                      <Descriptions.Item label="邮箱">{(form.getFieldValue('email') as string) || '—'}</Descriptions.Item>
                      <Descriptions.Item label="公司">{(form.getFieldValue('company') as string) || '—'}</Descriptions.Item>
                      <Descriptions.Item label="职位">{(form.getFieldValue('position') as string) || '—'}</Descriptions.Item>
                      <Descriptions.Item label="薪资">{form.getFieldValue('salary') != null ? `¥${form.getFieldValue('salary')}` : '—'}</Descriptions.Item>
                    </Descriptions>
                  </Card>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
                  <div>{step > 0 && <Button onClick={() => setStep(s => s - 1)}>上一步</Button>}</div>
                  <Space>
                    {!isLast && <Button type="primary" onClick={handleNext}>下一步</Button>}
                  </Space>
                </div>
                {mode === 'editable' && <LayoutFormActions onReset={() => form.reset()} />}
              </form>
            </FormProvider>
          )
        }}
      </StatusTabs>
    </div>
  )
})
