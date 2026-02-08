import type { SceneConfig } from '../types'

/**
 * 场景：oneOf/anyOf 条件 Schema
 *
 * 演示根据支付方式切换字段组合的能力。
 * 模拟 JSON Schema oneOf 模式，通过 paymentType 值动态展示不同的表单字段组。
 */

/** 支付方式选项 */
const PAYMENT_TYPE_OPTIONS = [
  { label: '信用卡', value: 'credit_card' },
  { label: '银行转账', value: 'bank_transfer' },
  { label: '支付宝', value: 'alipay' },
]

/** 各支付方式对应的字段 schema */
const TYPE_SCHEMAS: Record<string, Record<string, unknown>> = {
  credit_card: {
    cardNumber: { type: 'string', title: '卡号', required: true, rules: [{ pattern: '^\\d{16,19}$', message: '请输入16-19位数字' }] },
    cardHolder: { type: 'string', title: '持卡人', required: true },
    expiryDate: { type: 'string', title: '有效期', required: true, componentProps: { placeholder: 'MM/YY' } },
    cvv: { type: 'string', title: 'CVV', required: true, component: 'Password', rules: [{ pattern: '^\\d{3,4}$', message: '3-4位数字' }] },
  },
  bank_transfer: {
    bankName: { type: 'string', title: '开户银行', required: true },
    accountNumber: { type: 'string', title: '账号', required: true },
    accountName: { type: 'string', title: '户名', required: true },
    swift: { type: 'string', title: 'SWIFT 代码', componentProps: { placeholder: '国际汇款时填写' } },
  },
  alipay: {
    alipayAccount: { type: 'string', title: '支付宝账号', required: true, rules: [{ format: 'email', message: '请输入邮箱或手机号' }] },
    alipayName: { type: 'string', title: '真实姓名', required: true },
  },
}

const config: SceneConfig & { paymentTypeOptions: typeof PAYMENT_TYPE_OPTIONS; typeSchemas: typeof TYPE_SCHEMAS } = {
  title: 'oneOf/anyOf 条件 Schema',
  description: '根据支付方式切换字段组合 — 模拟 JSON Schema oneOf 模式',

  initialValues: {
    paymentType: 'credit_card',
    amount: 0,
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
        enum: PAYMENT_TYPE_OPTIONS,
      },
      /* 信用卡字段（默认展示） */
      ...TYPE_SCHEMAS.credit_card,
      /* 公共字段 */
      amount: { type: 'number', title: '支付金额', required: true, componentProps: { min: 0.01 } },
      remark: { type: 'string', title: '备注', component: 'Textarea' },
    },
  },

  fields: [
    { name: 'paymentType', label: '支付方式', required: true, component: 'RadioGroup', dataSource: PAYMENT_TYPE_OPTIONS },
    /* 信用卡字段 */
    { name: 'cardNumber', label: '卡号', required: true, component: 'Input', rules: [{ pattern: '^\\d{16,19}$', message: '请输入16-19位数字' }] },
    { name: 'cardHolder', label: '持卡人', required: true, component: 'Input' },
    { name: 'expiryDate', label: '有效期', required: true, component: 'Input', componentProps: { placeholder: 'MM/YY' } },
    { name: 'cvv', label: 'CVV', required: true, component: 'Password', rules: [{ pattern: '^\\d{3,4}$', message: '3-4位数字' }] },
    /* 银行转账字段 */
    { name: 'bankName', label: '开户银行', required: true, component: 'Input' },
    { name: 'accountNumber', label: '账号', required: true, component: 'Input' },
    { name: 'accountName', label: '户名', required: true, component: 'Input' },
    { name: 'swift', label: 'SWIFT 代码', component: 'Input', componentProps: { placeholder: '国际汇款时填写' } },
    /* 支付宝字段 */
    { name: 'alipayAccount', label: '支付宝账号', required: true, component: 'Input', rules: [{ format: 'email', message: '请输入邮箱或手机号' }] },
    { name: 'alipayName', label: '真实姓名', required: true, component: 'Input' },
    /* 公共字段 */
    { name: 'amount', label: '支付金额', required: true, component: 'InputNumber', componentProps: { min: 0.01, style: 'width: 100%' } },
    { name: 'remark', label: '备注', component: 'Textarea' },
  ],

  /** 支付方式选项（供实现侧使用） */
  paymentTypeOptions: PAYMENT_TYPE_OPTIONS,

  /** 各支付方式字段 schema（供实现侧动态切换使用） */
  typeSchemas: TYPE_SCHEMAS,
}

export default config
