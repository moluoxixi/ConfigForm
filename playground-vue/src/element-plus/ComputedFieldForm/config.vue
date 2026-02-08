<template>
  <div>
    <h2>计算字段</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">
      乘法（单价×数量） / 百分比 / 聚合 / 条件计算 — ConfigForm + ISchema 实现
    </p>
    <StatusTabs ref="st" v-slot="{ mode, showResult }">
      <ConfigForm
        :schema="withMode(schema, mode)"
        :initial-values="initialValues"
        @submit="showResult"
        @submit-failed="(e: any) => st?.showErrors(e)"
      />
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
/**
 * 计算字段 — Config 模式（Element Plus）
 *
 * 使用 ConfigForm + ISchema + reactions 实现计算字段：
 * - 乘法：单价 × 数量 = 总价
 * - 百分比：原价 × (1 - 折扣率) = 折后价
 * - 聚合：科目总分、平均分
 * - 条件计算：含税/不含税 计税
 */
import type { ISchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/core'
import { setupElementPlus, StatusTabs } from '@moluoxixi/ui-element-plus'
import { ConfigForm } from '@moluoxixi/vue'
import { ref } from 'vue'

setupElementPlus()

const st = ref<InstanceType<typeof StatusTabs>>()

function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}

const initialValues = {
  unitPrice: 100, quantity: 1, totalPrice: 100,
  originalPrice: 500, discountRate: 10, discountedPrice: 450,
  scoreA: 85, scoreB: 90, scoreC: 78, totalScore: 253, avgScore: 84.33,
  calcType: 'inclusive', amount: 1000, taxAmount: 115.04,
}

const schema: ISchema = {
  type: 'object',
  decoratorProps: { labelPosition: 'right', labelWidth: '150px', actions: { submit: '提交', reset: '重置' } },
  properties: {
    unitPrice: {
      type: 'number', title: '单价（元）', default: 100,
      component: 'InputNumber', componentProps: { min: 0, step: 0.01, style: 'width: 100%' },
    },
    quantity: {
      type: 'number', title: '数量', default: 1,
      component: 'InputNumber', componentProps: { min: 1, step: 1, style: 'width: 100%' },
    },
    totalPrice: {
      type: 'number', title: '总价（自动）',
      component: 'InputNumber', componentProps: { disabled: true, style: 'width: 100%' },
      description: '单价 × 数量',
      reactions: [{ watch: ['unitPrice', 'quantity'], fulfill: { run: (f: any, ctx: any) => {
        f.setValue(Math.round(((ctx.values.unitPrice as number) ?? 0) * ((ctx.values.quantity as number) ?? 0) * 100) / 100)
      } } }],
    },
    originalPrice: {
      type: 'number', title: '原价', default: 500,
      component: 'InputNumber', componentProps: { min: 0, style: 'width: 100%' },
    },
    discountRate: {
      type: 'number', title: '折扣率（%）', default: 10,
      component: 'InputNumber', componentProps: { min: 0, max: 100, style: 'width: 100%' },
    },
    discountedPrice: {
      type: 'number', title: '折后价（自动）',
      component: 'InputNumber', componentProps: { disabled: true, style: 'width: 100%' },
      reactions: [{ watch: ['originalPrice', 'discountRate'], fulfill: { run: (f: any, ctx: any) => {
        f.setValue(Math.round(((ctx.values.originalPrice as number) ?? 0) * (1 - ((ctx.values.discountRate as number) ?? 0) / 100) * 100) / 100)
      } } }],
    },
    scoreA: {
      type: 'number', title: '科目 A', default: 85,
      component: 'InputNumber', componentProps: { min: 0, max: 100, style: 'width: 100%' },
    },
    scoreB: {
      type: 'number', title: '科目 B', default: 90,
      component: 'InputNumber', componentProps: { min: 0, max: 100, style: 'width: 100%' },
    },
    scoreC: {
      type: 'number', title: '科目 C', default: 78,
      component: 'InputNumber', componentProps: { min: 0, max: 100, style: 'width: 100%' },
    },
    totalScore: {
      type: 'number', title: '总分（自动）',
      component: 'InputNumber', componentProps: { disabled: true, style: 'width: 100%' },
      reactions: [{ watch: ['scoreA', 'scoreB', 'scoreC'], fulfill: { run: (f: any, ctx: any) => {
        f.setValue(((ctx.values.scoreA as number) ?? 0) + ((ctx.values.scoreB as number) ?? 0) + ((ctx.values.scoreC as number) ?? 0))
      } } }],
    },
    avgScore: {
      type: 'number', title: '平均分（自动）',
      component: 'InputNumber', componentProps: { disabled: true, style: 'width: 100%' },
      reactions: [{ watch: ['scoreA', 'scoreB', 'scoreC'], fulfill: { run: (f: any, ctx: any) => {
        const sum = ((ctx.values.scoreA as number) ?? 0) + ((ctx.values.scoreB as number) ?? 0) + ((ctx.values.scoreC as number) ?? 0)
        f.setValue(Math.round(sum / 3 * 100) / 100)
      } } }],
    },
    calcType: {
      type: 'string', title: '计税方式', default: 'inclusive', component: 'RadioGroup',
      enum: [{ label: '含税 13%', value: 'inclusive' }, { label: '不含税', value: 'exclusive' }],
    },
    amount: {
      type: 'number', title: '金额', default: 1000,
      component: 'InputNumber', componentProps: { min: 0, style: 'width: 100%' },
    },
    taxAmount: {
      type: 'number', title: '税额（自动）',
      component: 'InputNumber', componentProps: { disabled: true, style: 'width: 100%' },
      reactions: [{ watch: ['calcType', 'amount'], fulfill: { run: (f: any, ctx: any) => {
        const t = ctx.values.calcType as string
        const a = (ctx.values.amount as number) ?? 0
        f.setValue(t === 'inclusive' ? Math.round(a / 1.13 * 0.13 * 100) / 100 : Math.round(a * 0.13 * 100) / 100)
      } } }],
    },
  },
}
</script>
