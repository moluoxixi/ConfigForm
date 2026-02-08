/**
 * 场景 1：基础表单 (Field 版)
 *
 * 覆盖：
 * - Input / Password / Textarea / InputNumber / Select / RadioGroup / CheckboxGroup / Switch / DatePicker
 * - 三种模式切换（编辑态 / 阅读态 / 禁用态）
 *
 * FormField + fieldProps 实现
 */
import React from 'react'
import { observer } from 'mobx-react-lite'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/react'
import { LayoutFormActions, StatusTabs, setupAntd } from '@moluoxixi/ui-antd'

setupAntd()

/** 默认初始值 */
const INITIAL_VALUES: Record<string, unknown> = {
  username: '',
  password: '',
  email: '',
  phone: '',
  age: 18,
  gender: undefined,
  marital: 'single',
  hobbies: [],
  notification: true,
  birthday: '',
  bio: '',
}

/**
 * 基础表单（Field 版）
 *
 * 展示所有注册的 antd 组件类型，并支持三种模式切换。
 */
export const BasicForm = observer((): React.ReactElement => {
  const form = useCreateForm({
    initialValues: { ...INITIAL_VALUES },
  })

  return (
    <div>
      <h2>基础表单（Field 版）</h2>
      <p style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 16, fontSize: 14 }}>
        Input / Password / Textarea / InputNumber / Select / RadioGroup / CheckboxGroup / Switch / DatePicker — FormField + fieldProps 实现
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
                <FormField name="username" fieldProps={{
                  label: '用户名',
                  required: true,
                  component: 'Input',
                  componentProps: { placeholder: '请输入用户名' },
                  rules: [
                    { minLength: 3, maxLength: 20, message: '用户名长度 3-20 个字符' },
                    { pattern: /^\w+$/, message: '仅允许字母、数字和下划线' },
                  ],
                }}
                />
                <FormField name="password" fieldProps={{
                  label: '密码',
                  required: true,
                  component: 'Password',
                  componentProps: { placeholder: '请输入密码' },
                  rules: [{ minLength: 8, message: '密码至少 8 个字符' }],
                }}
                />
                <FormField name="email" fieldProps={{
                  label: '邮箱',
                  required: true,
                  component: 'Input',
                  componentProps: { placeholder: '请输入邮箱' },
                  rules: [{ format: 'email', message: '请输入有效邮箱' }],
                }}
                />
                <FormField name="phone" fieldProps={{
                  label: '手机号',
                  component: 'Input',
                  componentProps: { placeholder: '请输入手机号' },
                  rules: [{ format: 'phone', message: '请输入有效手机号' }],
                }}
                />
                <FormField name="age" fieldProps={{
                  label: '年龄',
                  required: true,
                  component: 'InputNumber',
                  componentProps: { min: 0, max: 150, step: 1 },
                }}
                />
                <FormField name="gender" fieldProps={{
                  label: '性别',
                  component: 'Select',
                  componentProps: { placeholder: '请选择' },
                  dataSource: [
                    { label: '男', value: 'male' },
                    { label: '女', value: 'female' },
                    { label: '其他', value: 'other' },
                  ],
                }}
                />
                <FormField name="marital" fieldProps={{
                  label: '婚姻状况',
                  component: 'RadioGroup',
                  dataSource: [
                    { label: '未婚', value: 'single' },
                    { label: '已婚', value: 'married' },
                    { label: '离异', value: 'divorced' },
                  ],
                }}
                />
                <FormField name="hobbies" fieldProps={{
                  label: '兴趣爱好',
                  component: 'CheckboxGroup',
                  dataSource: [
                    { label: '阅读', value: 'reading' },
                    { label: '运动', value: 'sports' },
                    { label: '音乐', value: 'music' },
                    { label: '旅行', value: 'travel' },
                    { label: '编程', value: 'coding' },
                  ],
                }}
                />
                <FormField name="notification" fieldProps={{
                  label: '接收通知',
                  component: 'Switch',
                }}
                />
                <FormField name="birthday" fieldProps={{
                  label: '生日',
                  component: 'DatePicker',
                  componentProps: { placeholder: '请选择日期' },
                }}
                />
                <FormField name="bio" fieldProps={{
                  label: '个人简介',
                  component: 'Textarea',
                  componentProps: { placeholder: '不超过 200 字' },
                  rules: [{ maxLength: 200, message: '简介不超过 200 字' }],
                }}
                />
                {<LayoutFormActions onReset={() => form.reset()} />}
              </form>
            </FormProvider>
          )
        }}
      </StatusTabs>
    </div>
  )
})
