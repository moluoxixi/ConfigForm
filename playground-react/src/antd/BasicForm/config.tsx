import type { ISchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/shared'
import { ConfigForm } from '@moluoxixi/react'
import { setupAntd, StatusTabs } from '@moluoxixi/ui-antd'
import { Typography } from 'antd'
import { observer } from 'mobx-react-lite'
/**
 * 场景 1：基础表单
 *
 * 覆盖：
 * - Input / Password / Textarea / InputNumber / Select / RadioGroup / CheckboxGroup / Switch / DatePicker
 * - 三种模式切换（编辑态 / 阅读态 / 禁用态）
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
  username: '',
  password: '',
  email: '',
  phone: '',
  age: 18,
  gender: undefined,
  marital: 'single',
  hobbies: [],
  notification: true,
  birthday: '',
  bio: '',
}

/** 表单 Schema */
const schema: ISchema = {
  type: 'object',
  decoratorProps: {
    labelPosition: 'right',
    labelWidth: '120px',
  },
  properties: {
    /* 文本输入 */
    username: {
      type: 'string',
      title: '用户名',
      required: true,
      placeholder: '请输入用户名',
      rules: [
        { minLength: 3, maxLength: 20, message: '用户名长度 3-20 个字符' },
        { pattern: /^\w+$/, message: '仅允许字母、数字和下划线' },
      ],
    },

    /* 密码输入 */
    password: {
      type: 'string',
      title: '密码',
      required: true,
      component: 'Password',
      placeholder: '请输入密码',
      rules: [{ minLength: 8, message: '密码至少 8 个字符' }],
    },

    /* 邮箱 */
    email: {
      type: 'string',
      title: '邮箱',
      required: true,
      placeholder: '请输入邮箱',
      rules: [{ format: 'email', message: '请输入有效邮箱' }],
    },

    /* 手机号 */
    phone: {
      type: 'string',
      title: '手机号',
      placeholder: '请输入手机号',
      rules: [{ format: 'phone', message: '请输入有效手机号' }],
    },

    /* 年龄 */
    age: {
      type: 'number',
      title: '年龄',
      required: true,
      default: 18,
      componentProps: { min: 0, max: 150, step: 1 },
    },

    /* 性别 */
    gender: {
      type: 'string',
      title: '性别',
      placeholder: '请选择',
      enum: [
        { label: '男', value: 'male' },
        { label: '女', value: 'female' },
        { label: '其他', value: 'other' },
      ],
    },

    /* 婚姻状况 */
    marital: {
      type: 'string',
      title: '婚姻状况',
      component: 'RadioGroup',
      default: 'single',
      enum: [
        { label: '未婚', value: 'single' },
        { label: '已婚', value: 'married' },
        { label: '离异', value: 'divorced' },
      ],
    },

    /* 兴趣爱好 */
    hobbies: {
      type: 'array',
      title: '兴趣爱好',
      component: 'CheckboxGroup',
      default: [],
      enum: [
        { label: '阅读', value: 'reading' },
        { label: '运动', value: 'sports' },
        { label: '音乐', value: 'music' },
        { label: '旅行', value: 'travel' },
        { label: '编程', value: 'coding' },
      ],
    },

    /* 通知开关 */
    notification: {
      type: 'boolean',
      title: '接收通知',
      default: true,
    },

    /* 日期 */
    birthday: {
      type: 'string',
      title: '生日',
      placeholder: '请选择日期',
    },

    /* 多行文本 */
    bio: {
      type: 'string',
      title: '个人简介',
      component: 'Textarea',
      placeholder: '不超过 200 字',
      rules: [{ maxLength: 200, message: '简介不超过 200 字' }],
    },
  },
}

/**
 * 基础表单示例
 *
 * 展示所有注册的 antd 组件类型，并支持三种模式切换。
 */
export const BasicForm = observer((): React.ReactElement => {
  return (
    <div>
      <Title level={3}>基础表单</Title>
      <Paragraph type="secondary">
        Input / Password / Textarea / InputNumber / Select / RadioGroup / CheckboxGroup / Switch / DatePicker
      </Paragraph>
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
