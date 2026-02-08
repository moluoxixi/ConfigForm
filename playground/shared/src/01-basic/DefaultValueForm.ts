import type { SceneConfig } from '../types'

/**
 * 场景 4：默认值
 *
 * 覆盖：静态 defaultValue / 动态计算默认值 / initialValues 注入
 */

const COUNTRY_OPTIONS = [{ label: '中国', value: 'china' }, { label: '美国', value: 'usa' }, { label: '日本', value: 'japan' }]
const STATUS_OPTIONS = [{ label: '草稿', value: 'draft' }, { label: '发布', value: 'published' }]
const LEVEL_OPTIONS = [{ label: '银牌', value: 'silver' }, { label: '金牌', value: 'gold' }, { label: '钻石', value: 'diamond' }]

/** 等级 → 折扣率映射（供 Field 模式 effects 使用） */
export const LEVEL_DISCOUNT_MAP: Record<string, number> = { silver: 5, gold: 10, diamond: 20 }

const config: SceneConfig = {
  title: '默认值',
  description: '静态 defaultValue / 动态计算默认值 / initialValues 注入',

  initialValues: {
    country: 'china', status: 'draft', enableNotify: true,
    quantity: 1, unitPrice: 99.9, totalPrice: 99.9,
    level: 'silver', discountRate: 5,
  },

  schema: {
    type: 'object',
    decoratorProps: { actions: { submit: '提交', reset: '重置' }, labelPosition: 'right', labelWidth: '140px' },
    properties: {
      country: { type: 'string', title: '国家', default: 'china', description: '静态默认值', enum: COUNTRY_OPTIONS },
      status: { type: 'string', title: '状态', component: 'RadioGroup', default: 'draft', enum: STATUS_OPTIONS },
      enableNotify: { type: 'boolean', title: '开启通知', default: true },
      quantity: { type: 'number', title: '数量', default: 1, componentProps: { min: 1 } },
      unitPrice: { type: 'number', title: '单价', default: 99.9, componentProps: { min: 0, step: 0.1 } },
      totalPrice: {
        type: 'number', title: '总价（自动计算）', componentProps: { disabled: true }, description: '数量 × 单价',
        reactions: [{ watch: ['quantity', 'unitPrice'], fulfill: { run: (field: any, ctx: any) => {
          const q = (ctx.values.quantity as number) ?? 0
          const p = (ctx.values.unitPrice as number) ?? 0
          field.setValue(Math.round(q * p * 100) / 100)
        } } }],
      },
      level: { type: 'string', title: '会员等级', default: 'silver', enum: LEVEL_OPTIONS },
      discountRate: {
        type: 'number', title: '折扣率（%）', componentProps: { disabled: true }, description: '根据等级动态设置',
        reactions: [{ watch: 'level', fulfill: { run: (field: any, ctx: any) => {
          field.setValue(LEVEL_DISCOUNT_MAP[ctx.values.level as string] ?? 0)
        } } }],
      },
    },
  },
}

export default config
