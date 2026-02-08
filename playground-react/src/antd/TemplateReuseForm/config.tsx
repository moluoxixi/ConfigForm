import type { ISchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/shared'
import { ConfigForm } from '@moluoxixi/react'
import { setupAntd, StatusTabs } from '@moluoxixi/ui-antd'
import { observer } from 'mobx-react-lite'
/**
 * 场景 27：模板复用
 *
 * 覆盖：
 * - Schema 片段复用（公共字段定义提取）
 * - 继承与覆盖（基于模板扩展）
 * - 组合多个片段
 * - 三种模式切换
 */
import React, { useMemo, useState } from 'react'

setupAntd()

/** 工具：将 StatusTabs 的 mode 注入 schema */
function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}

/* ======================== Schema 片段（可复用模板） ======================== */

/** 通用个人信息片段 */
const PERSON_FRAGMENT: Record<string, ISchema> = {
  name: { type: 'string', title: '姓名', required: true, placeholder: '请输入姓名', rules: [{ minLength: 2, message: '至少 2 字' }] },
  phone: { type: 'string', title: '手机号', required: true, placeholder: '请输入手机号', rules: [{ format: 'phone', message: '无效手机号' }] },
  email: { type: 'string', title: '邮箱', placeholder: '请输入邮箱', rules: [{ format: 'email', message: '无效邮箱' }] },
}

/** 通用地址片段 */
const ADDRESS_FRAGMENT: Record<string, ISchema> = {
  province: { type: 'string', title: '省份', component: 'Select', enum: [{ label: '北京', value: 'bj' }, { label: '上海', value: 'sh' }, { label: '广东', value: 'gd' }] },
  city: { type: 'string', title: '城市', placeholder: '请输入城市' },
  address: { type: 'string', title: '详细地址', component: 'Textarea', placeholder: '请输入详细地址' },
}

/** 通用备注片段 */
const REMARK_FRAGMENT: Record<string, ISchema> = {
  remark: { type: 'string', title: '备注', component: 'Textarea', placeholder: '请输入备注', rules: [{ maxLength: 500, message: '不超过 500 字' }] },
}

/* ======================== 组合模板 ======================== */

type TemplateKey = 'employee' | 'customer' | 'supplier'

/**
 * 合并多个片段为完整 Schema
 *
 * @param fragments - 字段片段数组
 * @param overrides - 覆盖字段
 */
function composeSchema(
  fragments: Array<Record<string, ISchema>>,
  overrides: Record<string, Partial<ISchema>>,
): ISchema {
  const properties: Record<string, ISchema> = {}
  for (const fragment of fragments) {
    Object.assign(properties, fragment)
  }
  /* 应用覆盖 */
  for (const [key, override] of Object.entries(overrides)) {
    if (properties[key]) {
      properties[key] = { ...properties[key], ...override }
    }
    else {
      properties[key] = override as ISchema
    }
  }
  return {
    type: 'object',
    decoratorProps: {
      labelPosition: 'right',
      labelWidth: '120px',
    },
    properties,
  }
}

/** 模板配置 */
const TEMPLATES: Record<TemplateKey, { label: string, fragments: Array<Record<string, ISchema>>, overrides: Record<string, Partial<ISchema>> }> = {
  employee: {
    label: '员工入职',
    fragments: [PERSON_FRAGMENT, ADDRESS_FRAGMENT, REMARK_FRAGMENT],
    overrides: {
      department: { type: 'string', title: '部门', required: true, component: 'Select', enum: [{ label: '技术', value: 'tech' }, { label: '产品', value: 'product' }, { label: '设计', value: 'design' }] },
      position: { type: 'string', title: '职位', required: true, placeholder: '请输入职位' },
      name: { type: 'string', title: '员工姓名', required: true, placeholder: '请输入员工姓名', rules: [{ minLength: 2, message: '至少 2 字' }] },
    },
  },
  customer: {
    label: '客户登记',
    fragments: [PERSON_FRAGMENT, ADDRESS_FRAGMENT, REMARK_FRAGMENT],
    overrides: {
      company: { type: 'string', title: '所属公司', placeholder: '请输入公司名称' },
      level: { type: 'string', title: '客户等级', component: 'Select', enum: [{ label: '普通', value: 'normal' }, { label: 'VIP', value: 'vip' }, { label: '战略', value: 'strategic' }] },
      name: { type: 'string', title: '客户姓名', required: true, placeholder: '请输入客户姓名', rules: [{ minLength: 2, message: '至少 2 字' }] },
    },
  },
  supplier: {
    label: '供应商注册',
    fragments: [PERSON_FRAGMENT, ADDRESS_FRAGMENT, REMARK_FRAGMENT],
    overrides: {
      companyName: { type: 'string', title: '公司名称', required: true, placeholder: '公司全称' },
      creditCode: { type: 'string', title: '信用代码', required: true, placeholder: '18 位', rules: [{ pattern: /^[0-9A-Z]{18}$/, message: '无效信用代码' }] },
      supplyCategory: { type: 'string', title: '供应品类', required: true, component: 'Select', enum: [{ label: '原材料', value: 'raw' }, { label: '零部件', value: 'parts' }, { label: '服务', value: 'service' }] },
      name: { type: 'string', title: '联系人', required: true, placeholder: '联系人姓名', rules: [{ minLength: 2, message: '至少 2 字' }] },
    },
  },
}

/** 模板选项 */
const TEMPLATE_OPTIONS: Array<{ label: string, value: TemplateKey }> = Object.entries(TEMPLATES).map(([k, v]) => ({ label: v.label, value: k as TemplateKey }))

export const TemplateReuseForm = observer((): React.ReactElement => {
  const [template, setTemplate] = useState<TemplateKey>('employee')

  const currentTemplate = TEMPLATES[template]
  const schema = useMemo(
    () => composeSchema(currentTemplate.fragments, currentTemplate.overrides),
    [template],
  )

  return (
    <div>
      <h2>模板复用</h2>
      <p style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 16, fontSize: 14 }}>
        Schema 片段（个人信息 / 地址 / 备注）+ 继承覆盖 = 不同业务表单
      </p>

      {/* Segmented → 原生按钮组 */}
      <div style={{ display: 'inline-flex', background: '#f5f5f5', borderRadius: 6, padding: 2, marginBottom: 16 }}>
        {TEMPLATE_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => setTemplate(opt.value)}
            style={{
              padding: '4px 16px',
              fontSize: 14,
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              background: template === opt.value ? '#fff' : 'transparent',
              boxShadow: template === opt.value ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
              fontWeight: template === opt.value ? 500 : 400,
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
        <span style={{ display: 'inline-block', padding: '0 7px', fontSize: 12, background: '#e6f4ff', border: '1px solid #91caff', borderRadius: 4, color: '#1677ff' }}>复用片段：个人信息 + 地址 + 备注</span>
        <span style={{ display: 'inline-block', padding: '0 7px', fontSize: 12, background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 4, color: '#52c41a' }}>
          扩展字段：
          {Object.keys(currentTemplate.overrides).filter(k => !['name', 'phone', 'email'].includes(k)).length}
          {' '}
          个
        </span>
      </div>

      <StatusTabs>
        {({ mode, showResult, showErrors }) => (
          <ConfigForm
            schema={withMode(schema, mode)}
            onSubmit={showResult}
            onSubmitFailed={errors => showErrors(errors)}
          />
        )}
      </StatusTabs>
    </div>
  )
})
