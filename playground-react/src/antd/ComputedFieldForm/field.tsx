/**
 * 场景 9：计算字段 (Field 版)
 *
 * 覆盖：
 * - 简单计算：总价 = 单价 × 数量
 * - 百分比计算：折后价 = 原价 × (1 - 折扣率)
 * - 聚合统计：合计 = 项目 A + 项目 B + 项目 C
 * - 条件计算：根据条件选择不同计算公式
 * - 三种模式切换
 *
 * FormField + fieldProps 实现，reactions 写在 fieldProps 中。
 */
import React from 'react'
import { observer } from 'mobx-react-lite'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/react'
import { LayoutFormActions, StatusTabs, setupAntd } from '@moluoxixi/ui-antd'
import { Typography } from 'antd'

const { Title, Paragraph } = Typography

setupAntd()

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

/**
 * 计算字段示例（Field 版）
 */
export const ComputedFieldForm = observer((): React.ReactElement => {
  const form = useCreateForm({
    initialValues: { ...INITIAL_VALUES },
  })

  return (
    <div>
      <Title level={3}>计算字段 (Field 版)</Title>
      <Paragraph type="secondary">
        乘法（单价×数量） / 百分比（折后价） / 聚合（总分+平均分） / 条件计算（含税/不含税） —— FormField + fieldProps 实现
      </Paragraph>
      <StatusTabs>
        {({ mode, showResult, showErrors }) => {
          form.pattern = mode
          return (
            <FormProvider form={form}>
              <form onSubmit={async (e: React.FormEvent) => {
                e.preventDefault()
                const res = await form.submit()
                if (res.errors.length > 0) showErrors(res.errors)
                else showResult(res.values)
              }} noValidate>
                {/* ---- 场景 A：总价 = 单价 × 数量 ---- */}
                <FormField name="unitPrice" fieldProps={{ label: '单价（元）', component: 'InputNumber', componentProps: { min: 0, step: 0.01, style: { width: '100%' } } }} />
                <FormField name="quantity" fieldProps={{ label: '数量', component: 'InputNumber', componentProps: { min: 1, step: 1, style: { width: '100%' } } }} />
                <FormField name="totalPrice" fieldProps={{
                  label: '总价（自动计算）',
                  component: 'InputNumber',
                  componentProps: { disabled: true, style: { width: '100%' } },
                  description: '公式：单价 × 数量',
                  reactions: [{
                    watch: ['unitPrice', 'quantity'],
                    fulfill: {
                      run: (field, ctx) => {
                        const price = (ctx.values.unitPrice as number) ?? 0
                        const qty = (ctx.values.quantity as number) ?? 0
                        field.setValue(Math.round(price * qty * 100) / 100)
                      },
                    },
                  }],
                }}
                />

                {/* ---- 场景 B：折后价 ---- */}
                <FormField name="originalPrice" fieldProps={{ label: '原价（元）', component: 'InputNumber', componentProps: { min: 0, step: 1, style: { width: '100%' } } }} />
                <FormField name="discountRate" fieldProps={{ label: '折扣率（%）', component: 'InputNumber', componentProps: { min: 0, max: 100, step: 1, style: { width: '100%' } } }} />
                <FormField name="discountedPrice" fieldProps={{
                  label: '折后价（自动计算）',
                  component: 'InputNumber',
                  componentProps: { disabled: true, style: { width: '100%' } },
                  description: '公式：原价 × (1 - 折扣率 / 100)',
                  reactions: [{
                    watch: ['originalPrice', 'discountRate'],
                    fulfill: {
                      run: (field, ctx) => {
                        const price = (ctx.values.originalPrice as number) ?? 0
                        const rate = (ctx.values.discountRate as number) ?? 0
                        field.setValue(Math.round(price * (1 - rate / 100) * 100) / 100)
                      },
                    },
                  }],
                }}
                />

                {/* ---- 场景 C：聚合统计 ---- */}
                <FormField name="scoreA" fieldProps={{ label: '科目 A 分数', component: 'InputNumber', componentProps: { min: 0, max: 100, style: { width: '100%' } } }} />
                <FormField name="scoreB" fieldProps={{ label: '科目 B 分数', component: 'InputNumber', componentProps: { min: 0, max: 100, style: { width: '100%' } } }} />
                <FormField name="scoreC" fieldProps={{ label: '科目 C 分数', component: 'InputNumber', componentProps: { min: 0, max: 100, style: { width: '100%' } } }} />
                <FormField name="totalScore" fieldProps={{
                  label: '总分（自动计算）',
                  component: 'InputNumber',
                  componentProps: { disabled: true, style: { width: '100%' } },
                  description: '公式：A + B + C',
                  reactions: [{
                    watch: ['scoreA', 'scoreB', 'scoreC'],
                    fulfill: {
                      run: (field, ctx) => {
                        const a = (ctx.values.scoreA as number) ?? 0
                        const b = (ctx.values.scoreB as number) ?? 0
                        const c = (ctx.values.scoreC as number) ?? 0
                        field.setValue(a + b + c)
                      },
                    },
                  }],
                }}
                />
                <FormField name="avgScore" fieldProps={{
                  label: '平均分（自动计算）',
                  component: 'InputNumber',
                  componentProps: { disabled: true, style: { width: '100%' } },
                  description: '公式：(A + B + C) / 3',
                  reactions: [{
                    watch: ['scoreA', 'scoreB', 'scoreC'],
                    fulfill: {
                      run: (field, ctx) => {
                        const a = (ctx.values.scoreA as number) ?? 0
                        const b = (ctx.values.scoreB as number) ?? 0
                        const c = (ctx.values.scoreC as number) ?? 0
                        field.setValue(Math.round((a + b + c) / 3 * 100) / 100)
                      },
                    },
                  }],
                }}
                />

                {/* ---- 场景 D：条件计算 ---- */}
                <FormField name="calcType" fieldProps={{
                  label: '计税方式',
                  component: 'RadioGroup',
                  dataSource: [
                    { label: '含税（税率 13%）', value: 'inclusive' },
                    { label: '不含税', value: 'exclusive' },
                  ],
                }}
                />
                <FormField name="amount" fieldProps={{ label: '金额', component: 'InputNumber', componentProps: { min: 0, style: { width: '100%' } } }} />
                <FormField name="taxAmount" fieldProps={{
                  label: '税额（自动计算）',
                  component: 'InputNumber',
                  componentProps: { disabled: true, style: { width: '100%' } },
                  description: '含税：金额 / 1.13 × 0.13 | 不含税：金额 × 0.13',
                  reactions: [{
                    watch: ['calcType', 'amount'],
                    fulfill: {
                      run: (field, ctx) => {
                        const type = ctx.values.calcType as string
                        const amt = (ctx.values.amount as number) ?? 0
                        const TAX_RATE = 0.13
                        if (type === 'inclusive') {
                          field.setValue(Math.round(amt / (1 + TAX_RATE) * TAX_RATE * 100) / 100)
                        }
                        else {
                          field.setValue(Math.round(amt * TAX_RATE * 100) / 100)
                        }
                      },
                    },
                  }],
                }}
                />
                {mode === 'editable' && <LayoutFormActions onReset={() => form.reset()} />}
              </form>
            </FormProvider>
          )
        }}
      </StatusTabs>
    </div>
  )
})
