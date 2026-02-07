/**
 * 场景 3：必填与格式验证 (Field 版)
 *
 * 覆盖：
 * - 必填校验（required）
 * - 邮箱 / 手机号 / URL / 正则 / 长度 / 数值范围
 * - 三种模式切换
 *
 * FormField + fieldProps 实现
 */
import React from 'react'
import { observer } from 'mobx-react-lite'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/react'
import { LayoutFormActions, StatusTabs, setupAntd } from '@moluoxixi/ui-antd'
import { Typography } from 'antd'

const { Title, Paragraph } = Typography

setupAntd()

/** 默认初始值 */
const INITIAL_VALUES: Record<string, unknown> = {
  username: '',
  email: '',
  phone: '',
  website: '',
  nickname: '',
  age: undefined,
  zipCode: '',
  idCard: '',
  password: '',
}

/**
 * 必填与格式验证（Field 版）
 *
 * 展示 required / email / phone / url / pattern / minLength / min 等多种验证规则。
 */
export const BasicValidationForm = observer((): React.ReactElement => {
  const form = useCreateForm({
    initialValues: { ...INITIAL_VALUES },
  })

  return (
    <div>
      <Title level={3}>必填与格式验证 (Field 版)</Title>
      <Paragraph type="secondary">
        required / email / phone / URL / minLength / min-max / pattern 正则 —— FormField + fieldProps 实现
      </Paragraph>
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
                <FormField name="username" fieldProps={{
                  label: '用户名（必填）',
                  required: true,
                  component: 'Input',
                  componentProps: { placeholder: '请输入用户名' },
                  rules: [{ minLength: 3, maxLength: 20, message: '长度 3-20 个字符' }],
                }}
                />
                <FormField name="email" fieldProps={{
                  label: '邮箱',
                  required: true,
                  component: 'Input',
                  componentProps: { placeholder: '请输入邮箱地址' },
                  rules: [{ format: 'email', message: '请输入有效邮箱' }],
                }}
                />
                <FormField name="phone" fieldProps={{
                  label: '手机号',
                  required: true,
                  component: 'Input',
                  componentProps: { placeholder: '请输入 11 位手机号' },
                  rules: [{ format: 'phone', message: '请输入有效手机号' }],
                }}
                />
                <FormField name="website" fieldProps={{
                  label: '个人网站',
                  component: 'Input',
                  componentProps: { placeholder: 'https://example.com' },
                  rules: [{ format: 'url', message: '请输入有效的 URL 地址' }],
                }}
                />
                <FormField name="nickname" fieldProps={{
                  label: '昵称',
                  component: 'Input',
                  componentProps: { placeholder: '2-10 个字符' },
                  rules: [
                    { minLength: 2, message: '昵称至少 2 个字符' },
                    { maxLength: 10, message: '昵称最多 10 个字符' },
                  ],
                }}
                />
                <FormField name="age" fieldProps={{
                  label: '年龄',
                  required: true,
                  component: 'InputNumber',
                  componentProps: { min: 0, max: 150 },
                  rules: [{ min: 1, max: 150, message: '年龄范围 1-150' }],
                }}
                />
                <FormField name="zipCode" fieldProps={{
                  label: '邮政编码',
                  component: 'Input',
                  componentProps: { placeholder: '6 位数字' },
                  rules: [{ pattern: /^\d{6}$/, message: '邮编为 6 位数字' }],
                }}
                />
                <FormField name="idCard" fieldProps={{
                  label: '身份证号',
                  component: 'Input',
                  componentProps: { placeholder: '18 位身份证号' },
                  rules: [{ pattern: /^\d{17}[\dX]$/i, message: '请输入有效的 18 位身份证号' }],
                }}
                />
                <FormField name="password" fieldProps={{
                  label: '密码',
                  required: true,
                  component: 'Password',
                  componentProps: { placeholder: '8-32 位，含大小写字母和数字' },
                  rules: [
                    { minLength: 8, maxLength: 32, message: '密码长度 8-32 个字符' },
                    { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: '需包含大写字母、小写字母和数字' },
                  ],
                }}
                />
                {mode === 'editable' && <LayoutFormActions onReset={() => form.reset()} />}
              </form>
            </FormProvider>
          )
        }}
      </StatusTabs>
    </div>
  )
})
