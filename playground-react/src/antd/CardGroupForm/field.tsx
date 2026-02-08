/**
 * 卡片分组（Field 版）
 *
 * 使用 FormProvider + FormVoidField(LayoutCard) + FormField 实现卡片分组。
 * Card 容器通过 FormVoidField + component:'LayoutCard' 渲染，
 * 不直接使用 UI 库组件。
 */
import React from 'react'
import { observer } from 'mobx-react-lite'
import { FormField, FormProvider, FormVoidField, useCreateForm } from '@moluoxixi/react'
import { LayoutFormActions, StatusTabs, setupAntd } from '@moluoxixi/ui-antd'

setupAntd()

const INITIAL_VALUES: Record<string, unknown> = {
  username: '', password: '', confirmPwd: '',
  realName: '', gender: undefined, birthday: '',
  email: '', phone: '', address: '',
}

export const CardGroupForm = observer((): React.ReactElement => {
  const form = useCreateForm({ initialValues: { ...INITIAL_VALUES } })

  return (
    <div>
      <h2>卡片分组（Field 版）</h2>
      <p style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 16, fontSize: 14 }}>
        Card 多卡片分组布局 / 卡片内独立验证 — FormVoidField + LayoutCard 实现
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
                {/* 账户信息 — FormVoidField + LayoutCard */}
                <FormVoidField name="accountCard" fieldProps={{ component: 'LayoutCard', componentProps: { title: '账户信息' } }}>
                  {() => (
                    <>
                      <FormField name="username" fieldProps={{ label: '用户名', required: true, component: 'Input', componentProps: { placeholder: '请输入用户名' }, rules: [{ minLength: 3, message: '至少 3 字符' }] }} />
                      <FormField name="password" fieldProps={{ label: '密码', required: true, component: 'Password', componentProps: { placeholder: '请输入密码' }, rules: [{ minLength: 8, message: '至少 8 字符' }] }} />
                      <FormField name="confirmPwd" fieldProps={{
                        label: '确认密码', required: true, component: 'Password',
                        componentProps: { placeholder: '再次输入' },
                        rules: [{ validator: (v: unknown, _r: unknown, ctx: any) => v !== ctx.getFieldValue('password') ? '密码不一致' : undefined, trigger: 'blur' }],
                      }} />
                    </>
                  )}
                </FormVoidField>

                {/* 个人信息 — FormVoidField + LayoutCard */}
                <FormVoidField name="profileCard" fieldProps={{ component: 'LayoutCard', componentProps: { title: '个人信息' } }}>
                  {() => (
                    <>
                      <FormField name="realName" fieldProps={{ label: '真实姓名', required: true, component: 'Input', componentProps: { placeholder: '请输入姓名' } }} />
                      <FormField name="gender" fieldProps={{ label: '性别', component: 'RadioGroup', dataSource: [{ label: '男', value: 'male' }, { label: '女', value: 'female' }] }} />
                      <FormField name="birthday" fieldProps={{ label: '生日', component: 'DatePicker' }} />
                    </>
                  )}
                </FormVoidField>

                {/* 联系方式 — FormVoidField + LayoutCard */}
                <FormVoidField name="contactCard" fieldProps={{ component: 'LayoutCard', componentProps: { title: '联系方式' } }}>
                  {() => (
                    <>
                      <FormField name="email" fieldProps={{ label: '邮箱', required: true, component: 'Input', componentProps: { placeholder: '请输入邮箱' }, rules: [{ format: 'email', message: '无效邮箱' }] }} />
                      <FormField name="phone" fieldProps={{ label: '手机号', component: 'Input', componentProps: { placeholder: '请输入手机号' }, rules: [{ format: 'phone', message: '无效手机号' }] }} />
                      <FormField name="address" fieldProps={{ label: '地址', component: 'Textarea', componentProps: { placeholder: '请输入地址' } }} />
                    </>
                  )}
                </FormVoidField>
                <LayoutFormActions onReset={() => form.reset()} />
              </form>
            </FormProvider>
          )
        }}
      </StatusTabs>
    </div>
  )
})
