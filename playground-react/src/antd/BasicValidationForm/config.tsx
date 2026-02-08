import type { ISchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/shared'
import { ConfigForm } from '@moluoxixi/react'
import { setupAntd, StatusTabs } from '@moluoxixi/ui-antd'
import { observer } from 'mobx-react-lite'
/**
 * 场景 3：必填与格式验证
 *
 * 覆盖：
 * - 必填校验（required）
 * - 邮箱格式校验（format: 'email'）
 * - 手机号格式校验（format: 'phone'）
 * - URL 格式校验（format: 'url'）
 * - 长度限制（minLength / maxLength）
 * - 数值范围（min / max）
 * - 正则校验（pattern）
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
  username: '',
  email: '',
  phone: '',
  website: '',
  nickname: '',
  age: undefined,
  zipCode: '',
  idCard: '',
  password: '',
}

/** 表单 Schema */
const schema: ISchema = {
  type: 'object',
  decoratorProps: {
    labelPosition: 'right',
    labelWidth: '140px',
  },
  properties: {
    /* 必填 */
    username: {
      type: 'string',
      title: '用户名（必填）',
      required: true,
      placeholder: '请输入用户名',
      rules: [
        { minLength: 3, maxLength: 20, message: '长度 3-20 个字符' },
      ],
    },

    /* 邮箱格式 */
    email: {
      type: 'string',
      title: '邮箱',
      required: true,
      placeholder: '请输入邮箱地址',
      rules: [{ format: 'email', message: '请输入有效邮箱' }],
    },

    /* 手机号格式 */
    phone: {
      type: 'string',
      title: '手机号',
      required: true,
      placeholder: '请输入 11 位手机号',
      rules: [{ format: 'phone', message: '请输入有效手机号' }],
    },

    /* URL 格式 */
    website: {
      type: 'string',
      title: '个人网站',
      placeholder: 'https://example.com',
      rules: [{ format: 'url', message: '请输入有效的 URL 地址' }],
    },

    /* 长度限制 */
    nickname: {
      type: 'string',
      title: '昵称',
      placeholder: '2-10 个字符',
      rules: [
        { minLength: 2, message: '昵称至少 2 个字符' },
        { maxLength: 10, message: '昵称最多 10 个字符' },
      ],
    },

    /* 数值范围 */
    age: {
      type: 'number',
      title: '年龄',
      required: true,
      componentProps: { min: 0, max: 150 },
      rules: [{ min: 1, max: 150, message: '年龄范围 1-150' }],
    },

    /* 正则校验 */
    zipCode: {
      type: 'string',
      title: '邮政编码',
      placeholder: '6 位数字',
      rules: [{ pattern: /^\d{6}$/, message: '邮编为 6 位数字' }],
    },

    /* 身份证号 */
    idCard: {
      type: 'string',
      title: '身份证号',
      placeholder: '18 位身份证号',
      rules: [
        { pattern: /^\d{17}[\dX]$/i, message: '请输入有效的 18 位身份证号' },
      ],
    },

    /* 多规则组合 */
    password: {
      type: 'string',
      title: '密码',
      required: true,
      component: 'Password',
      placeholder: '8-32 位，含大小写字母和数字',
      rules: [
        { minLength: 8, maxLength: 32, message: '密码长度 8-32 个字符' },
        {
          pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
          message: '需包含大写字母、小写字母和数字',
        },
      ],
    },
  },
}

/**
 * 必填与格式验证示例
 *
 * 展示 required / email / phone / url / pattern / minLength / min 等多种验证规则。
 */
export const BasicValidationForm = observer((): React.ReactElement => {
  return (
    <div>
      <h2>必填与格式验证</h2>
      <p style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 16, fontSize: 14 }}>
        required / email / phone / URL / minLength / min-max / pattern 正则
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
