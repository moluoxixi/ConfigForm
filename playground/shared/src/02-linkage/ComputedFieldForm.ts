import type { SceneConfig } from '../types'

/**
 * 场景：计算字段
 *
 * 覆盖：乘法（单价×数量） / 百分比 / 聚合 / 条件计算
 */

/** 计税方式选项 */
const CALC_TYPE_OPTIONS = [
  { label: '含税 13%', value: 'inclusive' },
  { label: '不含税', value: 'exclusive' },
]

const config: SceneConfig = {
  title: '计算字段',
  description: '乘法（单价×数量） / 百分比 / 聚合 / 条件计算',

  initialValues: {
    unitPrice: 100, quantity: 1, totalPrice: 100,
    originalPrice: 500, discountRate: 10, discountedPrice: 450,
    scoreA: 85, scoreB: 90, scoreC: 78, totalScore: 253, avgScore: 84.33,
    calcType: 'inclusive', amount: 1000, taxAmount: 115.04,
  },

  schema: {
    type: 'object',
    decoratorProps: { actions: { submit: true, reset: true }, labelPosition: 'right', labelWidth: '150px' },
    properties: {
      unitPrice: { type: 'number', title: '单价（元）', default: 100, componentProps: { min: 0, step: 0.01, style: { width: '100%' } } },
      quantity: { type: 'number', title: '数量', default: 1, componentProps: { min: 1, step: 1, style: { width: '100%' } } },
      totalPrice: {
        type: 'number', title: '总价（自动）', description: '单价 × 数量',
        componentProps: { disabled: true, style: { width: '100%' } },
        reactions: [{
          watch: ['unitPrice', 'quantity'],
          fulfill: {
            run: (f: any, ctx: any) => {
              f.setValue(Math.round(((ctx.values.unitPrice as number) ?? 0) * ((ctx.values.quantity as number) ?? 0) * 100) / 100)
            },
          },
        }],
      },
      originalPrice: { type: 'number', title: '原价', default: 500, componentProps: { min: 0, style: { width: '100%' } } },
      discountRate: { type: 'number', title: '折扣率（%）', default: 10, componentProps: { min: 0, max: 100, style: { width: '100%' } } },
      discountedPrice: {
        type: 'number', title: '折后价（自动）',
        componentProps: { disabled: true, style: { width: '100%' } },
        reactions: [{
          watch: ['originalPrice', 'discountRate'],
          fulfill: {
            run: (f: any, ctx: any) => {
              f.setValue(Math.round(((ctx.values.originalPrice as number) ?? 0) * (1 - ((ctx.values.discountRate as number) ?? 0) / 100) * 100) / 100)
            },
          },
        }],
      },
      scoreA: { type: 'number', title: '科目 A', default: 85, componentProps: { min: 0, max: 100, style: { width: '100%' } } },
      scoreB: { type: 'number', title: '科目 B', default: 90, componentProps: { min: 0, max: 100, style: { width: '100%' } } },
      scoreC: { type: 'number', title: '科目 C', default: 78, componentProps: { min: 0, max: 100, style: { width: '100%' } } },
      totalScore: {
        type: 'number', title: '总分（自动）',
        componentProps: { disabled: true, style: { width: '100%' } },
        reactions: [{
          watch: ['scoreA', 'scoreB', 'scoreC'],
          fulfill: {
            run: (f: any, ctx: any) => {
              f.setValue(((ctx.values.scoreA as number) ?? 0) + ((ctx.values.scoreB as number) ?? 0) + ((ctx.values.scoreC as number) ?? 0))
            },
          },
        }],
      },
      avgScore: {
        type: 'number', title: '平均分（自动）',
        componentProps: { disabled: true, style: { width: '100%' } },
        reactions: [{
          watch: ['scoreA', 'scoreB', 'scoreC'],
          fulfill: {
            run: (f: any, ctx: any) => {
              const sum = ((ctx.values.scoreA as number) ?? 0) + ((ctx.values.scoreB as number) ?? 0) + ((ctx.values.scoreC as number) ?? 0)
              f.setValue(Math.round(sum / 3 * 100) / 100)
            },
          },
        }],
      },
      calcType: {
        type: 'string', title: '计税方式', component: 'RadioGroup',
        default: 'inclusive', enum: CALC_TYPE_OPTIONS,
      },
      amount: { type: 'number', title: '金额', default: 1000, componentProps: { min: 0, style: { width: '100%' } } },
      taxAmount: {
        type: 'number', title: '税额（自动）',
        componentProps: { disabled: true, style: { width: '100%' } },
        reactions: [{
          watch: ['calcType', 'amount'],
          fulfill: {
            run: (f: any, ctx: any) => {
              const t = ctx.values.calcType as string
              const a = (ctx.values.amount as number) ?? 0
              f.setValue(t === 'inclusive'
                ? Math.round(a / 1.13 * 0.13 * 100) / 100
                : Math.round(a * 0.13 * 100) / 100)
            },
          },
        }],
      },
    },
  },
}

export default config
