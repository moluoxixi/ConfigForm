import type { ISchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/shared'
import { ConfigForm } from '@moluoxixi/react'
import { setupAntd, StatusTabs } from '@moluoxixi/ui-antd'
import { Typography } from 'antd'
import { observer } from 'mobx-react-lite'
/**
 * 场景 14：嵌套对象
 *
 * 覆盖：
 * - 对象嵌套（properties 定义子字段）
 * - 多层路径取值（a.b.c 深层嵌套）
 * - 嵌套对象内联动
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

/** 表单 Schema */
const schema: ISchema = {
  type: 'object',
  decoratorProps: { labelPosition: 'right', labelWidth: '160px' },
  properties: {
    /* 顶层字段 */
    'title': {
      type: 'string',
      title: '标题',
      required: true,
      placeholder: '请输入标题',
    },

    /* ---- 一级嵌套：个人信息 ---- */
    'profile.name': {
      type: 'string',
      title: '姓名',
      required: true,
      placeholder: '请输入姓名',
    },
    'profile.age': {
      type: 'number',
      title: '年龄',
      componentProps: { min: 0, max: 150, style: { width: '100%' } },
    },
    'profile.gender': {
      type: 'string',
      title: '性别',
      enum: [
        { label: '男', value: 'male' },
        { label: '女', value: 'female' },
      ],
    },

    /* ---- 二级嵌套：联系方式 ---- */
    'profile.contact.phone': {
      type: 'string',
      title: '手机号',
      placeholder: '请输入手机号',
      rules: [{ format: 'phone', message: '请输入有效手机号' }],
    },
    'profile.contact.email': {
      type: 'string',
      title: '邮箱',
      placeholder: '请输入邮箱',
      rules: [{ format: 'email', message: '请输入有效邮箱' }],
    },

    /* ---- 三级嵌套：地址信息 ---- */
    'profile.address.province': {
      type: 'string',
      title: '省份',
      placeholder: '请选择省份',
      enum: [
        { label: '北京', value: 'beijing' },
        { label: '上海', value: 'shanghai' },
        { label: '广东', value: 'guangdong' },
      ],
    },
    'profile.address.city': {
      type: 'string',
      title: '城市',
      placeholder: '请输入城市',
    },
    'profile.address.detail': {
      type: 'string',
      title: '详细地址',
      component: 'Textarea',
      placeholder: '请输入详细地址',
    },

    /* ---- 独立嵌套对象：公司信息 ---- */
    'company.name': {
      type: 'string',
      title: '公司名称',
      placeholder: '请输入公司名称',
    },
    'company.department': {
      type: 'string',
      title: '部门',
      placeholder: '请输入部门',
    },
    'company.position': {
      type: 'string',
      title: '职位',
      placeholder: '请输入职位',
    },

    /* ---- 嵌套内联动 ---- */
    'settings.theme': {
      type: 'string',
      title: '主题',
      component: 'RadioGroup',
      defaultValue: 'light',
      enum: [
        { label: '亮色', value: 'light' },
        { label: '暗色', value: 'dark' },
        { label: '自定义', value: 'custom' },
      ],
    },
    'settings.customColor': {
      type: 'string',
      title: '自定义颜色',
      placeholder: '如 #1677ff',
      visible: false,
      reactions: [
        {
          watch: 'settings.theme',
          when: v => v[0] === 'custom',
          fulfill: { state: { visible: true, required: true } },
          otherwise: { state: { visible: false, required: false } },
        },
      ],
    },
  },
}

/**
 * 嵌套对象示例
 */
export const NestedObjectForm = observer((): React.ReactElement => {
  return (
    <div>
      <Title level={3}>嵌套对象</Title>
      <Paragraph type="secondary">
        一级嵌套（profile.name） / 多层嵌套（profile.contact.phone） / 嵌套内联动（settings.theme → customColor）
      </Paragraph>
      <StatusTabs resultTitle="提交结果（嵌套结构）">
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
