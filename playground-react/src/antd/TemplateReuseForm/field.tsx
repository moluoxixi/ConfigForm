/**
 * 场景 27：模板复用 (Field 版)
 *
 * 覆盖：
 * - Schema 片段复用（公共字段定义提取）
 * - 继承与覆盖（基于模板扩展）
 * - 组合多个片段
 * - 三种模式切换
 *
 * FormField + fieldProps 实现，通过 React 组件复用代替 Schema 片段合并。
 */
import React, { useState } from 'react'
import { observer } from 'mobx-react-lite'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/react'
import { LayoutFormActions, StatusTabs, setupAntd } from '@moluoxixi/ui-antd'
setupAntd()

type TemplateKey = 'employee' | 'customer' | 'supplier'

/** 模板配置 */
const TEMPLATES: Record<TemplateKey, { label: string }> = {
  employee: { label: '员工入职' },
  customer: { label: '客户登记' },
  supplier: { label: '供应商注册' },
}

/** 公共个人信息字段组件 */
const PersonFields = observer(({ nameLabel }: { nameLabel: string }): React.ReactElement => (
  <>
    <FormField name="name" fieldProps={{ label: nameLabel, required: true, component: 'Input', componentProps: { placeholder: `请输入${nameLabel}` }, rules: [{ minLength: 2, message: '至少 2 字' }] }} />
    <FormField name="phone" fieldProps={{ label: '手机号', required: true, component: 'Input', componentProps: { placeholder: '请输入手机号' }, rules: [{ format: 'phone', message: '无效手机号' }] }} />
    <FormField name="email" fieldProps={{ label: '邮箱', component: 'Input', componentProps: { placeholder: '请输入邮箱' }, rules: [{ format: 'email', message: '无效邮箱' }] }} />
  </>
))

/** 公共地址字段组件 */
const AddressFields = observer((): React.ReactElement => (
  <>
    <FormField name="province" fieldProps={{
      label: '省份',
      component: 'Select',
      dataSource: [{ label: '北京', value: 'bj' }, { label: '上海', value: 'sh' }, { label: '广东', value: 'gd' }],
    }}
    />
    <FormField name="city" fieldProps={{ label: '城市', component: 'Input', componentProps: { placeholder: '请输入城市' } }} />
    <FormField name="address" fieldProps={{ label: '详细地址', component: 'Textarea', componentProps: { placeholder: '请输入详细地址' } }} />
  </>
))

/** 公共备注字段组件 */
const RemarkField = observer((): React.ReactElement => (
  <FormField name="remark" fieldProps={{ label: '备注', component: 'Textarea', componentProps: { placeholder: '请输入备注' }, rules: [{ maxLength: 500, message: '不超过 500 字' }] }} />
))

/**
 * 模板复用示例（Field 版）
 */
export const TemplateReuseForm = observer((): React.ReactElement => {
  const [template, setTemplate] = useState<TemplateKey>('employee')

  const form = useCreateForm({
    initialValues: {
      name: '',
      phone: '',
      email: '',
      province: undefined,
      city: '',
      address: '',
      remark: '',
      /* 员工 */
      department: undefined,
      position: '',
      /* 客户 */
      company: '',
      level: undefined,
      /* 供应商 */
      companyName: '',
      creditCode: '',
      supplyCategory: undefined,
    },
  })

  return (
    <div>
      <h3>模板复用 (Field 版)</h3>
      <p style={{ color: 'rgba(0,0,0,0.45)' }}>
        公共字段组件复用（个人信息 / 地址 / 备注） + 场景扩展 —— FormField + fieldProps 实现
      </p>

      <div style={{ display: 'inline-flex', gap: 4, marginBottom: 16 }}>
        {Object.entries(TEMPLATES).map(([k, v]) => (
          <button key={k} type="button"
            style={{ padding: '4px 12px', background: template === k ? '#1677ff' : '#fff', color: template === k ? '#fff' : '#000', border: '1px solid #d9d9d9', borderRadius: 4, cursor: 'pointer' }}
            onClick={() => setTemplate(k as TemplateKey)}>
            {v.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
        <span style={{ display: 'inline-block', padding: '0 7px', fontSize: 12, lineHeight: '20px', background: '#f0f0f0', border: '1px solid #d9d9d9', borderRadius: 4 }}>复用片段：个人信息 + 地址 + 备注</span>
        <span style={{ display: 'inline-block', padding: '0 7px', fontSize: 12, lineHeight: '20px', background: '#f0f0f0', border: '1px solid #d9d9d9', borderRadius: 4 }}>当前模板：{TEMPLATES[template].label}</span>
      </div>

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
                {/* 公共：个人信息 */}
                <PersonFields nameLabel={
                  template === 'employee' ? '员工姓名'
                    : template === 'customer' ? '客户姓名'
                      : '联系人'
                }
                />

                {/* 员工扩展字段 */}
                {template === 'employee' && (
                  <>
                    <FormField name="department" fieldProps={{
                      label: '部门',
                      required: true,
                      component: 'Select',
                      dataSource: [{ label: '技术', value: 'tech' }, { label: '产品', value: 'product' }, { label: '设计', value: 'design' }],
                    }}
                    />
                    <FormField name="position" fieldProps={{ label: '职位', required: true, component: 'Input', componentProps: { placeholder: '请输入职位' } }} />
                  </>
                )}

                {/* 客户扩展字段 */}
                {template === 'customer' && (
                  <>
                    <FormField name="company" fieldProps={{ label: '所属公司', component: 'Input', componentProps: { placeholder: '请输入公司名称' } }} />
                    <FormField name="level" fieldProps={{
                      label: '客户等级',
                      component: 'Select',
                      dataSource: [{ label: '普通', value: 'normal' }, { label: 'VIP', value: 'vip' }, { label: '战略', value: 'strategic' }],
                    }}
                    />
                  </>
                )}

                {/* 供应商扩展字段 */}
                {template === 'supplier' && (
                  <>
                    <FormField name="companyName" fieldProps={{ label: '公司名称', required: true, component: 'Input', componentProps: { placeholder: '公司全称' } }} />
                    <FormField name="creditCode" fieldProps={{ label: '信用代码', required: true, component: 'Input', componentProps: { placeholder: '18 位' }, rules: [{ pattern: /^[0-9A-Z]{18}$/, message: '无效信用代码' }] }} />
                    <FormField name="supplyCategory" fieldProps={{
                      label: '供应品类',
                      required: true,
                      component: 'Select',
                      dataSource: [{ label: '原材料', value: 'raw' }, { label: '零部件', value: 'parts' }, { label: '服务', value: 'service' }],
                    }}
                    />
                  </>
                )}

                {/* 公共：地址 + 备注 */}
                <AddressFields />
                <RemarkField />
                {<LayoutFormActions onReset={() => form.reset()} />}
              </form>
            </FormProvider>
          )
        }}
      </StatusTabs>
    </div>
  )
})
