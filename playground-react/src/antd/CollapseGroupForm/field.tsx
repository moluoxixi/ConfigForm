/**
 * 折叠面板分组（Field 版）
 *
 * 使用 FormProvider + FormVoidField(LayoutCollapse) + FormField 实现折叠分组。
 * Collapse 容器通过 FormVoidField + component:'LayoutCollapse' 渲染，
 * 不直接使用 UI 库组件。
 */
import React from 'react'
import { observer } from 'mobx-react-lite'
import { FormField, FormProvider, FormVoidField, useCreateForm } from '@moluoxixi/react'
import { LayoutFormActions, StatusTabs, setupAntd } from '@moluoxixi/ui-antd'

setupAntd()

const INITIAL_VALUES: Record<string, unknown> = {
  name: '', email: '', phone: '',
  company: '', position: '', salary: undefined,
  school: '', major: '', degree: undefined,
  bio: '', hobby: '',
}

export const CollapseGroupForm = observer((): React.ReactElement => {
  const form = useCreateForm({ initialValues: { ...INITIAL_VALUES } })

  return (
    <div>
      <h2>折叠面板分组（Field 版）</h2>
      <p style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 16, fontSize: 14 }}>
        Collapse 分组 / 默认展开 / 折叠切换 — FormVoidField + LayoutCollapse 实现
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
                <FormVoidField name="collapseGroup" fieldProps={{ component: 'LayoutCollapse' }}>
                  {() => (
                    <>
                      <FormVoidField name="basicSection" fieldProps={{ componentProps: { title: '基本信息', collapsed: false } }}>
                        {() => (
                          <>
                            <FormField name="name" fieldProps={{ label: '姓名', required: true, component: 'Input', componentProps: { placeholder: '请输入姓名' } }} />
                            <FormField name="email" fieldProps={{ label: '邮箱', required: true, component: 'Input', componentProps: { placeholder: '请输入邮箱' }, rules: [{ format: 'email', message: '无效邮箱' }] }} />
                            <FormField name="phone" fieldProps={{ label: '手机号', component: 'Input', componentProps: { placeholder: '请输入手机号' } }} />
                          </>
                        )}
                      </FormVoidField>
                      <FormVoidField name="workSection" fieldProps={{ componentProps: { title: '工作信息' } }}>
                        {() => (
                          <>
                            <FormField name="company" fieldProps={{ label: '公司', component: 'Input', componentProps: { placeholder: '请输入公司' } }} />
                            <FormField name="position" fieldProps={{ label: '职位', component: 'Input', componentProps: { placeholder: '请输入职位' } }} />
                            <FormField name="salary" fieldProps={{ label: '薪资', component: 'InputNumber', componentProps: { min: 0, style: { width: '100%' } } }} />
                          </>
                        )}
                      </FormVoidField>
                      <FormVoidField name="eduSection" fieldProps={{ componentProps: { title: '教育经历', collapsed: true } }}>
                        {() => (
                          <>
                            <FormField name="school" fieldProps={{ label: '学校', component: 'Input', componentProps: { placeholder: '请输入学校' } }} />
                            <FormField name="major" fieldProps={{ label: '专业', component: 'Input', componentProps: { placeholder: '请输入专业' } }} />
                            <FormField name="degree" fieldProps={{ label: '学历', component: 'Select', dataSource: [{ label: '本科', value: 'bachelor' }, { label: '硕士', value: 'master' }, { label: '博士', value: 'phd' }] }} />
                          </>
                        )}
                      </FormVoidField>
                      <FormVoidField name="otherSection" fieldProps={{ componentProps: { title: '其他信息', collapsed: true } }}>
                        {() => (
                          <>
                            <FormField name="bio" fieldProps={{ label: '简介', component: 'Textarea', componentProps: { placeholder: '请输入简介' } }} />
                            <FormField name="hobby" fieldProps={{ label: '爱好', component: 'Input', componentProps: { placeholder: '请输入爱好' } }} />
                          </>
                        )}
                      </FormVoidField>
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
