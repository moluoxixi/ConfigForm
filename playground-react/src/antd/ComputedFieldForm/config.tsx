import type { ISchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/shared'
import { ConfigForm } from '@moluoxixi/react'
import { setupAntd, StatusTabs } from '@moluoxixi/ui-antd'
import { Typography } from 'antd'
import { observer } from 'mobx-react-lite'
/**
 * 场景 9：计算字段
 *
 * 覆盖：
 * - 简单计算：总价 = 单价 × 数量
 * - 百分比计算：折后价 = 原价 × (1 - 折扣率)
 * - 聚合统计：合计 = 项目 A + 项目 B + 项目 C
 * - 条件计算：根据条件选择不同计算公式
 * - 三种模式切换
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
  unitPrice: 100,
  quantity: 1,
  totalPrice: 100,
  originalPrice: 500,
  discountRate: 10,
  discountedPrice: 450,
  scoreA: 85,
  scoreB: 90,
  scoreC: 78,
  totalScore: 253,
  avgScore: 84.33,
  calcType: 'inclusive',
  amount: 1000,
  taxAmount: 115.04,
}

/** 表单 Schema */
const schema: ISchema = {
  type: 'object',
  decoratorProps: { labelPosition: 'right', labelWidth: '150px' },
  properties: {
    /* ---- 场景 A：总价 = 单价 × 数量 ---- */
    unitPrice: {
      type: 'number',
      title: '单价（元）',
      default: 100,
      componentProps: { min: 0, step: 0.01, style: { width: '100%' } },
    },
    quantity: {
      type: 'number',
      title: '数量',
      default: 1,
      componentProps: { min: 1, step: 1, style: { width: '100%' } },
    },
    totalPrice: {
      type: 'number',
      title: '总价（自动计算）',
      componentProps: { disabled: true, style: { width: '100%' } },
      description: '公式：单价 × 数量',
      reactions: [
        {
          watch: ['unitPrice', 'quantity'],
          fulfill: {
            run: (field, ctx) => {
              const price = (ctx.values.unitPrice as number) ?? 0
              const qty = (ctx.values.quantity as number) ?? 0
              field.setValue(Math.round(price * qty * 100) / 100)
            },
          },
        },
      ],
    },

    /* ---- 场景 B：折后价 ---- */
    originalPrice: {
      type: 'number',
      title: '原价（元）',
      default: 500,
      componentProps: { min: 0, step: 1, style: { width: '100%' } },
    },
    discountRate: {
      type: 'number',
      title: '折扣率（%）',
      default: 10,
      componentProps: { min: 0, max: 100, step: 1, style: { width: '100%' } },
    },
    discountedPrice: {
      type: 'number',
      title: '折后价（自动计算）',
      componentProps: { disabled: true, style: { width: '100%' } },
      description: '公式：原价 × (1 - 折扣率 / 100)',
      reactions: [
        {
          watch: ['originalPrice', 'discountRate'],
          fulfill: {
            run: (field, ctx) => {
              const price = (ctx.values.originalPrice as number) ?? 0
              const rate = (ctx.values.discountRate as number) ?? 0
              field.setValue(Math.round(price * (1 - rate / 100) * 100) / 100)
            },
          },
        },
      ],
    },

    /* ---- 场景 C：聚合统计 ---- */
    scoreA: {
      type: 'number',
      title: '科目 A 分数',
      default: 85,
      componentProps: { min: 0, max: 100, style: { width: '100%' } },
    },
    scoreB: {
      type: 'number',
      title: '科目 B 分数',
      default: 90,
      componentProps: { min: 0, max: 100, style: { width: '100%' } },
    },
    scoreC: {
      type: 'number',
      title: '科目 C 分数',
      default: 78,
      componentProps: { min: 0, max: 100, style: { width: '100%' } },
    },
    totalScore: {
      type: 'number',
      title: '总分（自动计算）',
      componentProps: { disabled: true, style: { width: '100%' } },
      description: '公式：A + B + C',
      reactions: [
        {
          watch: ['scoreA', 'scoreB', 'scoreC'],
          fulfill: {
            run: (field, ctx) => {
              const a = (ctx.values.scoreA as number) ?? 0
              const b = (ctx.values.scoreB as number) ?? 0
              const c = (ctx.values.scoreC as number) ?? 0
              field.setValue(a + b + c)
            },
          },
        },
      ],
    },
    avgScore: {
      type: 'number',
      title: '平均分（自动计算）',
      componentProps: { disabled: true, style: { width: '100%' } },
      description: '公式：(A + B + C) / 3',
      reactions: [
        {
          watch: ['scoreA', 'scoreB', 'scoreC'],
          fulfill: {
            run: (field, ctx) => {
              const a = (ctx.values.scoreA as number) ?? 0
              const b = (ctx.values.scoreB as number) ?? 0
              const c = (ctx.values.scoreC as number) ?? 0
              field.setValue(Math.round((a + b + c) / 3 * 100) / 100)
            },
          },
        },
      ],
    },

    /* ---- 场景 D：条件计算 ---- */
    calcType: {
      type: 'string',
      title: '计税方式',
      component: 'RadioGroup',
      default: 'inclusive',
      enum: [
        { label: '含税（税率 13%）', value: 'inclusive' },
        { label: '不含税', value: 'exclusive' },
      ],
    },
    amount: {
      type: 'number',
      title: '金额',
      default: 1000,
      componentProps: { min: 0, style: { width: '100%' } },
    },
    taxAmount: {
      type: 'number',
      title: '税额（自动计算）',
      componentProps: { disabled: true, style: { width: '100%' } },
      description: '含税：金额 / 1.13 × 0.13 | 不含税：金额 × 0.13',
      reactions: [
        {
          watch: ['calcType', 'amount'],
          fulfill: {
            run: (field, ctx) => {
              const type = ctx.values.calcType as string
              const amt = (ctx.values.amount as number) ?? 0
              const TAX_RATE = 0.13
              if (type === 'inclusive') {
                /* 含税价反算税额 */
                field.setValue(Math.round(amt / (1 + TAX_RATE) * TAX_RATE * 100) / 100)
              }
              else {
                /* 不含税直接算 */
                field.setValue(Math.round(amt * TAX_RATE * 100) / 100)
              }
            },
          },
        },
      ],
    },
  },
}

/**
 * 计算字段示例
 */
export const ComputedFieldForm = observer((): React.ReactElement => {
  return (
    <div>
      <Title level={3}>计算字段</Title>
      <Paragraph type="secondary">
        乘法（单价×数量） / 百分比（折后价） / 聚合（总分+平均分） / 条件计算（含税/不含税）
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
