/**
 * 场景 14：嵌套对象 (Field 版)
 *
 * 覆盖：
 * - 对象嵌套（properties 定义子字段）
 * - 多层路径取值（a.b.c 深层嵌套）
 * - 嵌套对象内联动
 * - 三种模式切换
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
  title: '',
  profile: {
    name: '',
    age: undefined,
    gender: undefined,
    contact: { phone: '', email: '' },
    address: { province: undefined, city: '', detail: '' },
  },
  company: { name: '', department: '', position: '' },
  settings: { theme: 'light', customColor: '' },
}

/**
 * 嵌套对象示例（Field 版）
 */
export const NestedObjectForm = observer((): React.ReactElement => {
  const form = useCreateForm({
    initialValues: { ...INITIAL_VALUES },
  })

  return (
    <div>
      <h2>嵌套对象 (Field 版)</h2>
      <p style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 16, fontSize: 14 }}>
        一级嵌套（profile.name） / 多层嵌套（profile.contact.phone） / 嵌套内联动（settings.theme → customColor） —— FormField + fieldProps 实现
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
                {/* 顶层字段 */}
                <FormField name="title" fieldProps={{ label: '标题', required: true, component: 'Input', componentProps: { placeholder: '请输入标题' } }} />

                {/* 一级嵌套：个人信息 */}
                <FormField name="profile.name" fieldProps={{ label: '姓名', required: true, component: 'Input', componentProps: { placeholder: '请输入姓名' } }} />
                <FormField name="profile.age" fieldProps={{ label: '年龄', component: 'InputNumber', componentProps: { min: 0, max: 150, style: { width: '100%' } } }} />
                <FormField name="profile.gender" fieldProps={{
                  label: '性别',
                  component: 'Select',
                  dataSource: [{ label: '男', value: 'male' }, { label: '女', value: 'female' }],
                }}
                />

                {/* 二级嵌套：联系方式 */}
                <FormField name="profile.contact.phone" fieldProps={{ label: '手机号', component: 'Input', componentProps: { placeholder: '请输入手机号' }, rules: [{ format: 'phone', message: '请输入有效手机号' }] }} />
                <FormField name="profile.contact.email" fieldProps={{ label: '邮箱', component: 'Input', componentProps: { placeholder: '请输入邮箱' }, rules: [{ format: 'email', message: '请输入有效邮箱' }] }} />

                {/* 三级嵌套：地址信息 */}
                <FormField name="profile.address.province" fieldProps={{
                  label: '省份',
                  component: 'Select',
                  componentProps: { placeholder: '请选择省份' },
                  dataSource: [{ label: '北京', value: 'beijing' }, { label: '上海', value: 'shanghai' }, { label: '广东', value: 'guangdong' }],
                }}
                />
                <FormField name="profile.address.city" fieldProps={{ label: '城市', component: 'Input', componentProps: { placeholder: '请输入城市' } }} />
                <FormField name="profile.address.detail" fieldProps={{ label: '详细地址', component: 'Textarea', componentProps: { placeholder: '请输入详细地址' } }} />

                {/* 独立嵌套对象：公司信息 */}
                <FormField name="company.name" fieldProps={{ label: '公司名称', component: 'Input', componentProps: { placeholder: '请输入公司名称' } }} />
                <FormField name="company.department" fieldProps={{ label: '部门', component: 'Input', componentProps: { placeholder: '请输入部门' } }} />
                <FormField name="company.position" fieldProps={{ label: '职位', component: 'Input', componentProps: { placeholder: '请输入职位' } }} />

                {/* 嵌套内联动 */}
                <FormField name="settings.theme" fieldProps={{
                  label: '主题',
                  component: 'RadioGroup',
                  dataSource: [
                    { label: '亮色', value: 'light' },
                    { label: '暗色', value: 'dark' },
                    { label: '自定义', value: 'custom' },
                  ],
                }}
                />
                <FormField name="settings.customColor" fieldProps={{
                  label: '自定义颜色',
                  component: 'Input',
                  componentProps: { placeholder: '如 #1677ff' },
                  visible: false,
                  reactions: [{
                    watch: 'settings.theme',
                    when: v => v[0] === 'custom',
                    fulfill: { state: { visible: true, required: true } },
                    otherwise: { state: { visible: false, required: false } },
                  }],
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
