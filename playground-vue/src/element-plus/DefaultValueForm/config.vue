<template>
  <div>
    <h2>默认值</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">
      静态 defaultValue / 动态计算默认值 / initialValues 注入 — ConfigForm + ISchema 实现
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
 * 默认值 — Config 模式（Element Plus）
 *
 * 使用 ConfigForm + ISchema 实现多种默认值场景：
 * - 静态 default（国家、状态、开关、数量）
 * - 计算默认值（总价 = 数量 × 单价）
 * - 根据关联字段动态设置（折扣率随会员等级变化）
 */
import type { ISchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/shared'
import { setupElementPlus, StatusTabs } from '@moluoxixi/ui-element-plus'
import { ConfigForm } from '@moluoxixi/vue'
import { ref } from 'vue'

setupElementPlus()

const st = ref<InstanceType<typeof StatusTabs>>()

function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}

const initialValues = {
  country: 'china', status: 'draft', enableNotify: true,
  quantity: 1, unitPrice: 99.9, totalPrice: 99.9,
  level: 'silver', discountRate: 5,
}

const schema: ISchema = {
  type: 'object',
  decoratorProps: { labelPosition: 'right', labelWidth: '140px', actions: { submit: '提交', reset: '重置' } },
  properties: {
    country: {
      type: 'string', title: '国家', default: 'china', component: 'Select',
      description: '静态默认值',
      enum: [{ label: '中国', value: 'china' }, { label: '美国', value: 'usa' }, { label: '日本', value: 'japan' }],
    },
    status: {
      type: 'string', title: '状态', default: 'draft', component: 'RadioGroup',
      enum: [{ label: '草稿', value: 'draft' }, { label: '发布', value: 'published' }],
    },
    enableNotify: { type: 'boolean', title: '开启通知', default: true, component: 'Switch' },
    quantity: {
      type: 'number', title: '数量', default: 1,
      component: 'InputNumber', componentProps: { min: 1 },
    },
    unitPrice: {
      type: 'number', title: '单价', default: 99.9,
      component: 'InputNumber', componentProps: { min: 0, step: 0.1 },
    },
    totalPrice: {
      type: 'number', title: '总价（自动计算）',
      component: 'InputNumber', componentProps: { disabled: true },
      description: '数量 × 单价',
      reactions: [{ watch: ['quantity', 'unitPrice'], fulfill: { run: (field: any, ctx: any) => {
        const q = (ctx.values.quantity as number) ?? 0
        const p = (ctx.values.unitPrice as number) ?? 0
        field.setValue(Math.round(q * p * 100) / 100)
      } } }],
    },
    level: {
      type: 'string', title: '会员等级', default: 'silver', component: 'Select',
      enum: [{ label: '银牌', value: 'silver' }, { label: '金牌', value: 'gold' }, { label: '钻石', value: 'diamond' }],
    },
    discountRate: {
      type: 'number', title: '折扣率（%）',
      component: 'InputNumber', componentProps: { disabled: true },
      description: '根据等级动态设置',
      reactions: [{ watch: 'level', fulfill: { run: (field: any, ctx: any) => {
        const map: Record<string, number> = { silver: 5, gold: 10, diamond: 20 }
        field.setValue(map[ctx.values.level as string] ?? 0)
      } } }],
    },
  },
}
</script>
