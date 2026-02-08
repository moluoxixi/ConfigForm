import type { ISchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/core'
import { ConfigForm } from '@moluoxixi/react'
import { setupAntd, StatusTabs } from '@moluoxixi/ui-antd'
import { observer } from 'mobx-react-lite'
/**
 * 场景 22：标签页切换分组
 *
 * 覆盖：
 * - Tabs 组件分组字段
 * - Tab 切换时保留数据
 * - 每个 Tab 独立验证
 * - 三种模式切换
 */
import React from 'react'

setupAntd()

/** 工具：将 StatusTabs 的 mode 注入 schema */
function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}

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

/** 表单 Schema */
const schema: ISchema = {
  type: 'object',
  decoratorProps: {
    labelPosition: 'right',
    labelWidth: '120px',
  },
  layout: {
    type: 'tabs',
    tabs: [
      { title: '基本信息', fields: ['name', 'email', 'phone'], showErrorBadge: true },
      { title: '工作信息', fields: ['company', 'position', 'department'], showErrorBadge: true },
      { title: '其他信息', fields: ['bio', 'website', 'github'], showErrorBadge: true },
    ],
  },
  properties: {
    name: { type: 'string', title: '姓名', required: true, placeholder: '请输入姓名' },
    email: { type: 'string', title: '邮箱', required: true, placeholder: '请输入邮箱', rules: [{ format: 'email', message: '请输入有效邮箱' }] },
    phone: { type: 'string', title: '手机号', placeholder: '请输入手机号', rules: [{ format: 'phone', message: '请输入有效手机号' }] },
    company: { type: 'string', title: '公司', required: true, placeholder: '请输入公司名称' },
    position: { type: 'string', title: '职位', placeholder: '请输入职位' },
    department: {
      type: 'string',
      title: '部门',
      component: 'Select',
      placeholder: '请选择部门',
      enum: [{ label: '技术部', value: 'tech' }, { label: '产品部', value: 'product' }, { label: '设计部', value: 'design' }],
    },
    bio: { type: 'string', title: '个人简介', component: 'Textarea', placeholder: '请输入简介', rules: [{ maxLength: 200, message: '不超过 200 字' }] },
    website: { type: 'string', title: '个人网站', placeholder: 'https://example.com', rules: [{ format: 'url', message: '请输入有效 URL' }] },
    github: { type: 'string', title: 'GitHub', placeholder: 'GitHub 地址' },
  },
}

/**
 * 标签页分组示例
 */
export const TabGroupForm = observer((): React.ReactElement => {
  return (
    <div>
      <h2>标签页切换分组</h2>
      <p style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 16, fontSize: 14 }}>
        Tabs 分组 / 切换保留数据 / Tab 错误徽标 / 独立验证
      </p>
      <StatusTabs>
        {({ mode, showResult, showErrors }) => (
          <ConfigForm
            schema={withMode(schema, mode)}
            initialValues={INITIAL_VALUES}
            onSubmit={showResult}
            onSubmitFailed={errors => showErrors(errors)}
          />
        )}
      </StatusTabs>
    </div>
  )
})
