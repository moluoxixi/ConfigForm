import type { SceneConfig } from '../types'
import { lowerCodePlugin } from '@moluoxixi/plugin-lower-code'

/**
 * 场景：数据脱敏插件
 *
 * 演示 lowerCodePlugin.masking 的数据脱敏能力：
 * - 内置脱敏类型：phone / email / idcard / bankcard / name / address
 * - 通配符匹配字段路径
 * - 自定义脱敏函数
 */

const config: SceneConfig = {
  title: '数据脱敏',
  description: 'lowerCodePlugin.masking — 手机号 / 邮箱 / 身份证 / 银行卡 / 姓名 / 地址',

  initialValues: {
    realName: '张三丰',
    phone: '13812345678',
    email: 'zhangsan@example.com',
    idCard: '110101199003071234',
    bankCard: '6222021234567890123',
    address: '北京市朝阳区建国路88号院1号楼',
  },

  schema: {
    type: 'object',
    decoratorProps: { labelPosition: 'right', labelWidth: '120px', actions: { submit: '提交', reset: '重置' } },
    properties: {
      realName: {
        type: 'string',
        title: '姓名',
        description: '脱敏结果: 张**',
        required: true,
        componentProps: { style: 'width: 300px' },
      },
      phone: {
        type: 'string',
        title: '手机号',
        description: '脱敏结果: 138****5678',
        required: true,
        rules: [{ format: 'phone', message: '请输入有效手机号' }],
        componentProps: { style: 'width: 300px' },
      },
      email: {
        type: 'string',
        title: '邮箱',
        description: '脱敏结果: z***n@example.com',
        rules: [{ format: 'email', message: '请输入有效邮箱' }],
        componentProps: { style: 'width: 300px' },
      },
      idCard: {
        type: 'string',
        title: '身份证号',
        description: '脱敏结果: 110***********1234',
        componentProps: { style: 'width: 300px' },
      },
      bankCard: {
        type: 'string',
        title: '银行卡号',
        description: '脱敏结果: **** **** **** 0123',
        componentProps: { style: 'width: 300px' },
      },
      address: {
        type: 'string',
        title: '地址',
        description: '脱敏结果: 北京市朝阳区*************',
        component: 'Textarea',
        componentProps: { rows: 2, style: 'width: 300px' },
      },
    },
  },

  plugins: [
    lowerCodePlugin({
      history: false,
      dirtyChecker: false,
      acl: false,
      submitRetry: false,
      subForm: false,
      masking: {
        rules: [
          { pattern: 'realName', type: 'name' },
          { pattern: 'phone', type: 'phone' },
          { pattern: 'email', type: 'email' },
          { pattern: 'idCard', type: 'idcard' },
          { pattern: 'bankCard', type: 'bankcard' },
          { pattern: 'address', type: 'address' },
        ],
      },
    }),
  ],
}

export default config
