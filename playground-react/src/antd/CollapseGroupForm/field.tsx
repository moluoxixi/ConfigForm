/**
 * 场景 23：折叠面板分组 (Field 版)
 *
 * 覆盖：
 * - Collapse 面板分组
 * - 默认展开 / 折叠
 * - 展开收起切换
 * - 三种模式切换
 *
 * FormField + fieldProps 实现，手动用 Collapse 包裹分组。
 */
import React from 'react'
import { observer } from 'mobx-react-lite'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/react'
import { LayoutFormActions, StatusTabs, setupAntd } from '@moluoxixi/ui-antd'
import { Collapse, Typography } from 'antd'

const { Title, Paragraph } = Typography

setupAntd()

/** 默认初始值 */
const INITIAL_VALUES: Record<string, unknown> = {
  name: '',
  email: '',
  phone: '',
  company: '',
  position: '',
  salary: undefined,
  school: '',
  major: '',
  degree: undefined,
  bio: '',
  hobby: '',
}

/**
 * 折叠面板分组（Field 版）
 */
export const CollapseGroupForm = observer((): React.ReactElement => {
  const form = useCreateForm({
    initialValues: { ...INITIAL_VALUES },
  })

  return (
    <div>
      <Title level={3}>折叠面板分组 (Field 版)</Title>
      <Paragraph type="secondary">Collapse 分组 / 默认展开 / 折叠切换 —— FormField + fieldProps 实现</Paragraph>
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
                <Collapse
                  defaultActiveKey={['basic', 'work']}
                  style={{ marginBottom: 16 }}
                  items={[
                    {
                      key: 'basic',
                      label: '基本信息',
                      children: (
                        <>
                          <FormField name="name" fieldProps={{ label: '姓名', required: true, component: 'Input', componentProps: { placeholder: '请输入姓名' } }} />
                          <FormField name="email" fieldProps={{ label: '邮箱', required: true, component: 'Input', componentProps: { placeholder: '请输入邮箱' }, rules: [{ format: 'email', message: '无效邮箱' }] }} />
                          <FormField name="phone" fieldProps={{ label: '手机号', component: 'Input', componentProps: { placeholder: '请输入手机号' } }} />
                        </>
                      ),
                    },
                    {
                      key: 'work',
                      label: '工作信息',
                      children: (
                        <>
                          <FormField name="company" fieldProps={{ label: '公司', component: 'Input', componentProps: { placeholder: '请输入公司' } }} />
                          <FormField name="position" fieldProps={{ label: '职位', component: 'Input', componentProps: { placeholder: '请输入职位' } }} />
                          <FormField name="salary" fieldProps={{ label: '薪资', component: 'InputNumber', componentProps: { min: 0, style: { width: '100%' } } }} />
                        </>
                      ),
                    },
                    {
                      key: 'education',
                      label: '教育经历',
                      children: (
                        <>
                          <FormField name="school" fieldProps={{ label: '学校', component: 'Input', componentProps: { placeholder: '请输入学校' } }} />
                          <FormField name="major" fieldProps={{ label: '专业', component: 'Input', componentProps: { placeholder: '请输入专业' } }} />
                          <FormField name="degree" fieldProps={{
                            label: '学历',
                            component: 'Select',
                            dataSource: [{ label: '本科', value: 'bachelor' }, { label: '硕士', value: 'master' }, { label: '博士', value: 'phd' }],
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
                          <FormField name="bio" fieldProps={{ label: '简介', component: 'Textarea', componentProps: { placeholder: '请输入简介' } }} />
                          <FormField name="hobby" fieldProps={{ label: '爱好', component: 'Input', componentProps: { placeholder: '请输入爱好' } }} />
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
