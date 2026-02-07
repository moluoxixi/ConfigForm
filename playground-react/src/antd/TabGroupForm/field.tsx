/**
 * 场景 22：标签页切换分组 (Field 版)
 *
 * 覆盖：
 * - Tabs 组件分组字段
 * - Tab 切换时保留数据
 * - 每个 Tab 独立验证
 * - 三种模式切换
 *
 * FormField + fieldProps 实现，手动用 antd Tabs 包裹分组。
 */
import React from 'react'
import { observer } from 'mobx-react-lite'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/react'
import { LayoutFormActions, StatusTabs, setupAntd } from '@moluoxixi/ui-antd'
import { Tabs, Typography } from 'antd'

const { Title, Paragraph } = Typography

setupAntd()

/** 默认初始值 */
const INITIAL_VALUES: Record<string, unknown> = {
  name: '',
  email: '',
  phone: '',
  company: '',
  position: '',
  department: undefined,
  bio: '',
  website: '',
  github: '',
}

/**
 * 标签页分组示例（Field 版）
 */
export const TabGroupForm = observer((): React.ReactElement => {
  const form = useCreateForm({
    initialValues: { ...INITIAL_VALUES },
  })

  return (
    <div>
      <Title level={3}>标签页切换分组 (Field 版)</Title>
      <Paragraph type="secondary">
        Tabs 分组 / 切换保留数据 / 独立验证 —— FormField + fieldProps 实现
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
                <Tabs
                  items={[
                    {
                      key: 'basic',
                      label: '基本信息',
                      children: (
                        <>
                          <FormField name="name" fieldProps={{ label: '姓名', required: true, component: 'Input', componentProps: { placeholder: '请输入姓名' } }} />
                          <FormField name="email" fieldProps={{ label: '邮箱', required: true, component: 'Input', componentProps: { placeholder: '请输入邮箱' }, rules: [{ format: 'email', message: '请输入有效邮箱' }] }} />
                          <FormField name="phone" fieldProps={{ label: '手机号', component: 'Input', componentProps: { placeholder: '请输入手机号' }, rules: [{ format: 'phone', message: '请输入有效手机号' }] }} />
                        </>
                      ),
                    },
                    {
                      key: 'work',
                      label: '工作信息',
                      children: (
                        <>
                          <FormField name="company" fieldProps={{ label: '公司', required: true, component: 'Input', componentProps: { placeholder: '请输入公司名称' } }} />
                          <FormField name="position" fieldProps={{ label: '职位', component: 'Input', componentProps: { placeholder: '请输入职位' } }} />
                          <FormField name="department" fieldProps={{
                            label: '部门',
                            component: 'Select',
                            componentProps: { placeholder: '请选择部门' },
                            dataSource: [{ label: '技术部', value: 'tech' }, { label: '产品部', value: 'product' }, { label: '设计部', value: 'design' }],
                          }}
                          />
                        </>
                      ),
                    },
                    {
                      key: 'other',
                      label: '其他信息',
                      children: (
                        <>
                          <FormField name="bio" fieldProps={{ label: '个人简介', component: 'Textarea', componentProps: { placeholder: '请输入简介' }, rules: [{ maxLength: 200, message: '不超过 200 字' }] }} />
                          <FormField name="website" fieldProps={{ label: '个人网站', component: 'Input', componentProps: { placeholder: 'https://example.com' }, rules: [{ format: 'url', message: '请输入有效 URL' }] }} />
                          <FormField name="github" fieldProps={{ label: 'GitHub', component: 'Input', componentProps: { placeholder: 'GitHub 地址' } }} />
                        </>
                      ),
                    },
                  ]}
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
