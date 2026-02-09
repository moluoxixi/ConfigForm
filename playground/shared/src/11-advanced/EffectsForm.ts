import type { SceneConfig } from '../types'

/**
 * 场景：Effects 副作用联动
 *
 * 演示 reactions + {{表达式}} 实现字段间自动联动计算。
 * - 监听单价/数量变化 → 自动计算总价
 * - 折扣变化 → 自动计算实付金额
 */

const config: SceneConfig = {
  title: 'Effects 副作用联动',
  description: 'reactions + {{表达式}} 实现字段联动计算',

  initialValues: {
    unitPrice: 100,
    quantity: 1,
    totalPrice: 100,
    discount: 0,
    finalPrice: 100,
  },

  schema: {
    type: 'object',
    decoratorProps: { labelPosition: 'right', labelWidth: '120px', actions: { submit: '提交', reset: '重置' } },
    properties: {
      unitPrice: { type: 'number', title: '单价', componentProps: { min: 0 } },
      quantity: { type: 'number', title: '数量', componentProps: { min: 1 } },
      totalPrice: {
        type: 'number',
        title: '总价（自动计算）',
        componentProps: { disabled: true },
        reactions: [{
          watch: ['unitPrice', 'quantity'],
          fulfill: { value: '{{($values.unitPrice || 0) * ($values.quantity || 0)}}' },
        }],
      },
      discount: { type: 'number', title: '折扣(%)', componentProps: { min: 0, max: 100 } },
      finalPrice: {
        type: 'number',
        title: '实付（自动计算）',
        componentProps: { disabled: true },
        reactions: [{
          watch: ['totalPrice', 'discount'],
          fulfill: { value: '{{($values.totalPrice || 0) * (1 - ($values.discount || 0) / 100)}}' },
        }],
      },
    },
  },
}

export default config
