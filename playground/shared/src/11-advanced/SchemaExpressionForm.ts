import type { SceneConfig } from '../types'

/**
 * 场景：Schema 表达式
 *
 * 演示 {{表达式}} 驱动的字段联动能力。
 * 全部使用字符串表达式，Schema 可纯 JSON 序列化。
 */

/** 订单类型选项 */
const ORDER_TYPE_OPTIONS = [
  { label: '普通订单', value: 'normal' },
  { label: '加急订单', value: 'urgent' },
  { label: 'VIP 订单', value: 'vip' },
]

/** 发票类型选项 */
const INVOICE_TYPE_OPTIONS = [
  { label: '个人', value: 'personal' },
  { label: '企业', value: 'company' },
]

const config: SceneConfig = {
  title: 'Schema 表达式',
  description: '通过 {{表达式}} 驱动的 Schema 联动 — 条件显隐 / 自动计算 / 状态控制',

  initialValues: {
    orderType: 'normal',
    amount: 0,
    urgentFee: 0,
    totalAmount: 0,
    needInvoice: false,
    invoiceTitle: '',
    invoiceType: 'personal',
    taxNumber: '',
  },

  schema: {
    type: 'object',
    decoratorProps: { labelPosition: 'right', labelWidth: '120px', actions: { submit: '提交', reset: '重置' } },
    properties: {
      orderType: {
        type: 'string',
        title: '订单类型',
        enum: ORDER_TYPE_OPTIONS,
      },
      amount: {
        type: 'number',
        title: '订单金额',
        required: true,
        componentProps: { min: 0 },
      },
      /* 条件联动：orderType === 'urgent' 时显示加急费用 */
      urgentFee: {
        type: 'number',
        title: '加急费用',
        componentProps: { min: 0 },
        reactions: [{
          watch: ['orderType', 'amount'],
          when: '{{$values.orderType === "urgent"}}',
          fulfill: {
            state: { visible: true },
            value: '{{Math.round(($values.amount || 0) * 0.2)}}',
          },
          otherwise: {
            state: { visible: false },
            value: 0,
          },
        }],
      },
      /* 自动计算：totalAmount = amount + urgentFee */
      totalAmount: {
        type: 'number',
        title: '订单总额（自动计算）',
        componentProps: { disabled: true },
        reactions: [{
          watch: ['amount', 'urgentFee'],
          fulfill: { value: '{{($values.amount || 0) + ($values.urgentFee || 0)}}' },
        }],
      },
      needInvoice: {
        type: 'boolean',
        title: '需要发票',
      },
      /* 条件联动：needInvoice === true 时显示 */
      invoiceTitle: {
        type: 'string',
        title: '发票抬头',
        visible: false,
        reactions: [{
          watch: 'needInvoice',
          when: '{{$values.needInvoice === true}}',
          fulfill: { state: { visible: true, required: true } },
          otherwise: { state: { visible: false, required: false } },
        }],
      },
      invoiceType: {
        type: 'string',
        title: '发票类型',
        visible: false,
        component: 'RadioGroup',
        enum: INVOICE_TYPE_OPTIONS,
        reactions: [{
          watch: 'needInvoice',
          when: '{{$values.needInvoice === true}}',
          fulfill: { state: { visible: true } },
          otherwise: { state: { visible: false } },
        }],
      },
      /* 多条件联动：needInvoice && invoiceType === 'company' 时显示税号 */
      taxNumber: {
        type: 'string',
        title: '税号',
        visible: false,
        reactions: [{
          watch: ['needInvoice', 'invoiceType'],
          when: '{{$values.needInvoice === true && $values.invoiceType === "company"}}',
          fulfill: { state: { visible: true, required: true }, componentProps: { placeholder: '请输入税号' } },
          otherwise: { state: { visible: false, required: false } },
        }],
      },
    },
  },
}

export default config
