import type { ISchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/shared'
import { ConfigForm } from '@moluoxixi/react'
import { setupAntd, StatusTabs } from '@moluoxixi/ui-antd'
import { Typography } from 'antd'
import { observer } from 'mobx-react-lite'
/**
 * 场景 23：折叠面板分组
 *
 * 覆盖：
 * - Collapse 面板分组
 * - 默认展开 / 折叠
 * - 展开收起切换
 * - 三种模式切换
 */
import React from 'react'

const { Title, Paragraph } = Typography

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
  salary: undefined,
  school: '',
  major: '',
  degree: undefined,
  bio: '',
  hobby: '',
}

/** 表单 Schema */
const schema: ISchema = {
  type: 'object',
  decoratorProps: {
    labelPosition: 'right',
    labelWidth: '120px',
  },
  layout: {
    type: 'groups',
    groups: [
      { title: '基本信息', component: 'Collapse', fields: ['name', 'email', 'phone'], collapsed: false },
      { title: '工作信息', component: 'Collapse', fields: ['company', 'position', 'salary'] },
      { title: '教育经历', component: 'Collapse', fields: ['school', 'major', 'degree'], collapsed: true },
      { title: '其他信息', component: 'Collapse', fields: ['bio', 'hobby'], collapsed: true },
    ],
  },
  properties: {
    name: { type: 'string', title: '姓名', required: true, placeholder: '请输入姓名' },
    email: { type: 'string', title: '邮箱', required: true, placeholder: '请输入邮箱', rules: [{ format: 'email', message: '无效邮箱' }] },
    phone: { type: 'string', title: '手机号', placeholder: '请输入手机号' },
    company: { type: 'string', title: '公司', placeholder: '请输入公司' },
    position: { type: 'string', title: '职位', placeholder: '请输入职位' },
    salary: { type: 'number', title: '薪资', component: 'InputNumber', componentProps: { min: 0, style: { width: '100%' } } },
    school: { type: 'string', title: '学校', placeholder: '请输入学校' },
    major: { type: 'string', title: '专业', placeholder: '请输入专业' },
    degree: {
      type: 'string',
      title: '学历',
      component: 'Select',
      enum: [{ label: '本科', value: 'bachelor' }, { label: '硕士', value: 'master' }, { label: '博士', value: 'phd' }],
    },
    bio: { type: 'string', title: '简介', component: 'Textarea', placeholder: '请输入简介' },
    hobby: { type: 'string', title: '爱好', placeholder: '请输入爱好' },
  },
}

export const CollapseGroupForm = observer((): React.ReactElement => {
  return (
    <div>
      <Title level={3}>折叠面板分组</Title>
      <Paragraph type="secondary">Collapse 分组 / 默认展开 / 折叠切换</Paragraph>
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
