import type { SceneConfig } from '../types'

/**
 * 场景：Effects 副作用联动
 *
 * 演示 createForm({ effects }) 实现字段间自动联动计算。
 * - onFieldValueChange 监听单价/数量变化 → 自动计算总价
 * - 折扣变化 → 自动计算实付金额
 * - onValuesChange 监听所有值变化
 */

const config: SceneConfig = {
  title: 'Effects 副作用联动',
  description: 'createForm({ effects }) 实现字段联动计算 — onFieldValueChange / onValuesChange',

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
          fulfill: {
            value: (field: unknown, ctx: { values: Record<string, unknown> }): number =>
              ((ctx.values.unitPrice as number) ?? 0) * ((ctx.values.quantity as number) ?? 0),
          },
        }],
      },
      discount: { type: 'number', title: '折扣(%)', componentProps: { min: 0, max: 100 } },
      finalPrice: {
        type: 'number',
        title: '实付（自动计算）',
        componentProps: { disabled: true },
        reactions: [{
          watch: ['totalPrice', 'discount'],
          fulfill: {
            value: (field: unknown, ctx: { values: Record<string, unknown> }): number =>
              ((ctx.values.totalPrice as number) ?? 0) * (1 - ((ctx.values.discount as number) ?? 0) / 100),
          },
        }],
      },
    },
  },
}

export default config
