/**
 * 场景 26：动态 Schema (Field 版)
 *
 * 覆盖：
 * - 场景切换（个人 / 企业 / 学生）
 * - 根据场景动态渲染不同的 FormField 集合
 * - 三种模式切换
 *
 * FormField + fieldProps 实现，通过 React 条件渲染代替 mergeSchema。
 */
import React, { useState } from 'react'
import { observer } from 'mobx-react-lite'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/react'
import { LayoutFormActions, StatusTabs, setupAntd } from '@moluoxixi/ui-antd'
import { Segmented, Tag, Typography } from 'antd'

const { Title, Paragraph } = Typography

setupAntd()

type ScenarioKey = 'individual' | 'enterprise' | 'student'

/** 场景标签 */
const SCENARIO_LABELS: Record<ScenarioKey, string> = {
  individual: '个人用户',
  enterprise: '企业用户',
  student: '学生认证',
}

/**
 * 动态 Schema 示例（Field 版）
 */
export const DynamicSchemaForm = observer((): React.ReactElement => {
  const [scenario, setScenario] = useState<ScenarioKey>('individual')

  const form = useCreateForm({
    initialValues: {
      name: '',
      phone: '',
      email: '',
      remark: '',
      /* 个人 */
      idCard: '',
      city: undefined,
      /* 企业 */
      companyName: '',
      creditCode: '',
      industry: undefined,
      /* 学生 */
      school: '',
      studentId: '',
      major: '',
    },
  })

  return (
    <div>
      <Title level={3}>动态 Schema (Field 版)</Title>
      <Paragraph type="secondary">场景切换 / 动态字段集合 —— FormField + fieldProps 实现</Paragraph>

      <div style={{ marginBottom: 16 }}>
        <Segmented
          value={scenario}
          onChange={v => setScenario(v as ScenarioKey)}
          options={Object.entries(SCENARIO_LABELS).map(([k, v]) => ({ label: v, value: k }))}
        />
      </div>

      <Tag color="green" style={{ marginBottom: 12 }}>
        当前：
        {SCENARIO_LABELS[scenario]}
      </Tag>

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
                {/* 公共字段 */}
                <FormField name="name" fieldProps={{
                  label: scenario === 'enterprise' ? '联系人' : '姓名',
                  required: true,
                  component: 'Input',
                  componentProps: { placeholder: scenario === 'enterprise' ? '联系人姓名' : '请输入姓名' },
                }}
                />
                <FormField name="phone" fieldProps={{ label: '手机号', required: true, component: 'Input', componentProps: { placeholder: '请输入手机号' }, rules: [{ format: 'phone', message: '无效手机号' }] }} />
                <FormField name="email" fieldProps={{ label: '邮箱', component: 'Input', componentProps: { placeholder: '请输入邮箱' }, rules: [{ format: 'email', message: '无效邮箱' }] }} />

                {/* 个人用户 */}
                {scenario === 'individual' && (
                  <>
                    <FormField name="idCard" fieldProps={{ label: '身份证号', required: true, component: 'Input', componentProps: { placeholder: '18 位身份证号' }, rules: [{ pattern: /^\d{17}[\dX]$/i, message: '无效身份证号' }] }} />
                    <FormField name="city" fieldProps={{
                      label: '居住城市',
                      component: 'Select',
                      dataSource: [{ label: '北京', value: 'beijing' }, { label: '上海', value: 'shanghai' }, { label: '广州', value: 'guangzhou' }],
                    }}
                    />
                  </>
                )}

                {/* 企业用户 */}
                {scenario === 'enterprise' && (
                  <>
                    <FormField name="companyName" fieldProps={{ label: '公司名称', required: true, component: 'Input', componentProps: { placeholder: '公司全称' } }} />
                    <FormField name="creditCode" fieldProps={{ label: '信用代码', required: true, component: 'Input', componentProps: { placeholder: '18 位信用代码' }, rules: [{ pattern: /^[0-9A-Z]{18}$/, message: '无效信用代码' }] }} />
                    <FormField name="industry" fieldProps={{
                      label: '行业',
                      component: 'Select',
                      dataSource: [{ label: 'IT', value: 'it' }, { label: '金融', value: 'finance' }, { label: '制造', value: 'mfg' }],
                    }}
                    />
                  </>
                )}

                {/* 学生认证 */}
                {scenario === 'student' && (
                  <>
                    <FormField name="school" fieldProps={{ label: '学校', required: true, component: 'Input', componentProps: { placeholder: '学校全称' } }} />
                    <FormField name="studentId" fieldProps={{ label: '学号', required: true, component: 'Input', componentProps: { placeholder: '学号' }, rules: [{ pattern: /^\d{8,14}$/, message: '学号 8-14 位数字' }] }} />
                    <FormField name="major" fieldProps={{ label: '专业', required: true, component: 'Input', componentProps: { placeholder: '专业名称' } }} />
                  </>
                )}

                {/* 公共备注 */}
                <FormField name="remark" fieldProps={{ label: '备注', component: 'Textarea', componentProps: { placeholder: '请输入备注' } }} />
                {mode === 'editable' && <LayoutFormActions onReset={() => form.reset()} />}
              </form>
            </FormProvider>
          )
        }}
      </StatusTabs>
    </div>
  )
})
