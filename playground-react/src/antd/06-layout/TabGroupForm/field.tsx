/**
 * 标签页切换分组（Field 版）
 *
 * 使用 FormProvider + FormVoidField(LayoutTabs) + FormField 实现标签页分组。
 * Tabs 容器通过 FormVoidField + component:'LayoutTabs' 渲染，
 * 不直接使用 UI 库组件。
 */
import React from 'react'
import { observer } from 'mobx-react-lite'
import { FormField, FormProvider, FormVoidField, useCreateForm } from '@moluoxixi/react'
import { LayoutFormActions, StatusTabs, setupAntd } from '@moluoxixi/ui-antd'

setupAntd()

const INITIAL_VALUES: Record<string, unknown> = {
  name: '', email: '', phone: '',
  company: '', position: '', department: undefined,
  bio: '', website: '', github: '',
}

export const TabGroupForm = observer((): React.ReactElement => {
  const form = useCreateForm({ initialValues: { ...INITIAL_VALUES } })

  return (
    <div>
      <h2>标签页切换分组（Field 版）</h2>
      <p style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 16, fontSize: 14 }}>
        Tabs 分组 / 切换保留数据 / 独立验证 — FormVoidField + LayoutTabs 实现
      </p>
      <StatusTabs>
        {({ mode, showResult, showErrors }) => {
          form.pattern = mode
          return (
            <FormProvider form={form}>
                <FormVoidField name="tabs" fieldProps={{ component: 'LayoutTabs' }}>
                  {() => (
                    <>
                      <FormVoidField name="basicTab" fieldProps={{ componentProps: { title: '基本信息' } }}>
                        {() => (
                          <>
                            <FormField name="name" fieldProps={{ label: '姓名', required: true, component: 'Input', componentProps: { placeholder: '请输入姓名' } }} />
                            <FormField name="email" fieldProps={{ label: '邮箱', required: true, component: 'Input', componentProps: { placeholder: '请输入邮箱' }, rules: [{ format: 'email', message: '请输入有效邮箱' }] }} />
                            <FormField name="phone" fieldProps={{ label: '手机号', component: 'Input', componentProps: { placeholder: '请输入手机号' }, rules: [{ format: 'phone', message: '请输入有效手机号' }] }} />
                          </>
                        )}
                      </FormVoidField>
                      <FormVoidField name="workTab" fieldProps={{ componentProps: { title: '工作信息' } }}>
                        {() => (
                          <>
                            <FormField name="company" fieldProps={{ label: '公司', required: true, component: 'Input', componentProps: { placeholder: '请输入公司名称' } }} />
                            <FormField name="position" fieldProps={{ label: '职位', component: 'Input', componentProps: { placeholder: '请输入职位' } }} />
                            <FormField name="department" fieldProps={{ label: '部门', component: 'Select', componentProps: { placeholder: '请选择部门' }, dataSource: [{ label: '技术部', value: 'tech' }, { label: '产品部', value: 'product' }, { label: '设计部', value: 'design' }] }} />
                          </>
                        )}
                      </FormVoidField>
                      <FormVoidField name="otherTab" fieldProps={{ componentProps: { title: '其他信息' } }}>
                        {() => (
                          <>
                            <FormField name="bio" fieldProps={{ label: '个人简介', component: 'Textarea', componentProps: { placeholder: '请输入简介' }, rules: [{ maxLength: 200, message: '不超过 200 字' }] }} />
                            <FormField name="website" fieldProps={{ label: '个人网站', component: 'Input', componentProps: { placeholder: 'https://example.com' }, rules: [{ format: 'url', message: '请输入有效 URL' }] }} />
                            <FormField name="github" fieldProps={{ label: 'GitHub', component: 'Input', componentProps: { placeholder: 'GitHub 地址' } }} />
                          </>
                        )}
                      </FormVoidField>
                    </>
                  )}
                </FormVoidField>
                <LayoutFormActions onSubmit={showResult} onSubmitFailed={showErrors} />
            </FormProvider>
          )
        }}
      </StatusTabs>
    </div>
  )
})
