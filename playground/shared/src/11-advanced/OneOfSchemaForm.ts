import type { SceneConfig } from '../types'

/**
 * 场景：oneOf 条件 Schema（编译器自动切换分支）
 *
 * 演示 oneOf + discriminator 能力：
 * - 根据「支付方式」字段值自动切换显示不同的字段组
 * - 编译器自动为每个分支字段生成隐式 reactions（watch discriminator，切换 display）
 * - 无需手写 reactions，Schema 声明即驱动
 *
 * 核心功能覆盖：
 * - ISchema.oneOf 条件分支
 * - ISchema.discriminator 鉴别器
 * - 编译器自动生成 reactions
 */

const config: SceneConfig = {
  title: 'oneOf 条件 Schema',
  description: 'oneOf + discriminator — 编译器自动切换分支，无需手写 reactions',

  initialValues: {
    paymentType: 'credit_card',
    amount: 100,
    remark: '',
  },

  schema: {
    type: 'object',
    decoratorProps: { labelPosition: 'right', labelWidth: '120px', actions: { submit: '提交', reset: '重置' } },
    properties: {
      paymentType: {
        type: 'string',
        title: '支付方式',
        required: true,
        component: 'RadioGroup',
        enum: [
          { label: '信用卡', value: 'credit_card' },
          { label: '银行转账', value: 'bank_transfer' },
          { label: '支付宝', value: 'alipay' },
        ],
      },
    },
    /* 编译器自动处理：非活跃分支字段 display='none'，活跃分支 display='visible' */
    discriminator: 'paymentType',
    oneOf: [
      {
        when: { paymentType: 'credit_card' },
        properties: {
          cardNumber: { type: 'string', title: '卡号', required: true, rules: [{ pattern: '^\\d{16,19}$', message: '请输入 16-19 位数字' }] },
          cardHolder: { type: 'string', title: '持卡人', required: true },
          expiryDate: { type: 'string', title: '有效期', required: true, componentProps: { placeholder: 'MM/YY' } },
          cvv: { type: 'string', title: 'CVV', required: true, component: 'Password', rules: [{ pattern: '^\\d{3,4}$', message: '3-4 位数字' }] },
        },
      },
      {
        when: { paymentType: 'bank_transfer' },
        properties: {
          bankName: { type: 'string', title: '开户银行', required: true },
          accountNumber: { type: 'string', title: '银行账号', required: true },
          accountName: { type: 'string', title: '户名', required: true },
        },
      },
      {
        when: { paymentType: 'alipay' },
        properties: {
          alipayAccount: { type: 'string', title: '支付宝账号', required: true },
          alipayName: { type: 'string', title: '真实姓名', required: true },
        },
      },
    ],
    /* 公共字段在 properties 中正常定义 */
  },
}

/* 追加公共字段到 properties（oneOf 之外的字段始终显示） */
config.schema.properties!.amount = { type: 'number', title: '支付金额', required: true, componentProps: { min: 0.01, style: 'width: 100%' } }
config.schema.properties!.remark = { type: 'string', title: '备注', component: 'Textarea' }

export default config
