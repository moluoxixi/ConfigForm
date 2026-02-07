/**
 * 场景 24：卡片分组 (Field 版)
 *
 * 覆盖：
 * - Card 组件包裹字段组
 * - 多卡片布局
 * - 卡片内独立验证提示
 * - 三种模式切换
 *
 * FormField + fieldProps 实现，手动用 Card 包裹分组。
 */
import React from 'react'
import { observer } from 'mobx-react-lite'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/react'
import { LayoutFormActions, StatusTabs, setupAntd } from '@moluoxixi/ui-antd'
import { Card, Typography } from 'antd'

const { Title, Paragraph } = Typography

setupAntd()

/** 默认初始值 */
const INITIAL_VALUES: Record<string, unknown> = {
  username: '',
  password: '',
  confirmPwd: '',
  realName: '',
  gender: undefined,
  birthday: '',
  email: '',
  phone: '',
  address: '',
}

/**
 * 卡片分组（Field 版）
 */
export const CardGroupForm = observer((): React.ReactElement => {
  const form = useCreateForm({
    initialValues: { ...INITIAL_VALUES },
  })

  return (
    <div>
      <Title level={3}>卡片分组 (Field 版)</Title>
      <Paragraph type="secondary">Card 多卡片分组布局 / 卡片内独立验证 —— FormField + fieldProps 实现</Paragraph>
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
                {/* 账户信息 */}
                <Card title="账户信息" style={{ marginBottom: 16 }}>
                  <FormField name="username" fieldProps={{ label: '用户名', required: true, component: 'Input', componentProps: { placeholder: '请输入用户名' }, rules: [{ minLength: 3, message: '至少 3 字符' }] }} />
                  <FormField name="password" fieldProps={{ label: '密码', required: true, component: 'Password', componentProps: { placeholder: '请输入密码' }, rules: [{ minLength: 8, message: '至少 8 字符' }] }} />
                  <FormField name="confirmPwd" fieldProps={{
                    label: '确认密码',
                    required: true,
                    component: 'Password',
                    componentProps: { placeholder: '再次输入' },
                    rules: [{
                      validator: (v, _r, ctx) => {
                        if (v !== ctx.getFieldValue('password')) return '密码不一致'
                        return undefined
                      },
                      trigger: 'blur',
                    }],
                  }}
                  />
                </Card>

                {/* 个人信息 */}
                <Card title="个人信息" style={{ marginBottom: 16 }}>
                  <FormField name="realName" fieldProps={{ label: '真实姓名', required: true, component: 'Input', componentProps: { placeholder: '请输入姓名' } }} />
                  <FormField name="gender" fieldProps={{
                    label: '性别',
                    component: 'RadioGroup',
                    dataSource: [{ label: '男', value: 'male' }, { label: '女', value: 'female' }],
                  }}
                  />
                  <FormField name="birthday" fieldProps={{ label: '生日', component: 'DatePicker' }} />
                </Card>

                {/* 联系方式 */}
                <Card title="联系方式" style={{ marginBottom: 16 }}>
                  <FormField name="email" fieldProps={{ label: '邮箱', required: true, component: 'Input', componentProps: { placeholder: '请输入邮箱' }, rules: [{ format: 'email', message: '无效邮箱' }] }} />
                  <FormField name="phone" fieldProps={{ label: '手机号', component: 'Input', componentProps: { placeholder: '请输入手机号' }, rules: [{ format: 'phone', message: '无效手机号' }] }} />
                  <FormField name="address" fieldProps={{ label: '地址', component: 'Textarea', componentProps: { placeholder: '请输入地址' } }} />
                </Card>
                {mode === 'editable' && <LayoutFormActions onReset={() => form.reset()} />}
              </form>
            </FormProvider>
          )
        }}
      </StatusTabs>
    </div>
  )
})
