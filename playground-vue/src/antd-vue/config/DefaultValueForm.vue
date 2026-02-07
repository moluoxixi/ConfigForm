<template>
  <div>
    <h2>默认值</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">静态 defaultValue / 动态计算默认值 / initialValues 注入</p>
    <PlaygroundForm :schema="schema" :initial-values="initialValues" />
  </div>
</template>

<script setup lang="ts">
import { setupAntdVue } from '@moluoxixi/ui-antd-vue'
import type { FormSchema } from '@moluoxixi/schema'
import PlaygroundForm from '../../components/PlaygroundForm.vue'

setupAntdVue()

const initialValues = { country: 'china', status: 'draft', enableNotify: true, quantity: 1, unitPrice: 99.9, totalPrice: 99.9, level: 'silver', discountRate: 5 }

const schema: FormSchema = {
  form: { labelPosition: 'right', labelWidth: '140px' },
  fields: {
    country: { type: 'string', label: '国家', component: 'Select', wrapper: 'FormItem', defaultValue: 'china', description: '静态默认值', enum: [{ label: '中国', value: 'china' }, { label: '美国', value: 'usa' }, { label: '日本', value: 'japan' }] },
    status: { type: 'string', label: '状态', component: 'RadioGroup', wrapper: 'FormItem', defaultValue: 'draft', enum: [{ label: '草稿', value: 'draft' }, { label: '发布', value: 'published' }] },
    enableNotify: { type: 'boolean', label: '开启通知', component: 'Switch', wrapper: 'FormItem', defaultValue: true },
    quantity: { type: 'number', label: '数量', component: 'InputNumber', wrapper: 'FormItem', defaultValue: 1, componentProps: { min: 1 } },
    unitPrice: { type: 'number', label: '单价', component: 'InputNumber', wrapper: 'FormItem', defaultValue: 99.9, componentProps: { min: 0, step: 0.1 } },
    totalPrice: {
      type: 'number', label: '总价（自动计算）', component: 'InputNumber', wrapper: 'FormItem', componentProps: { disabled: true }, description: '数量 × 单价',
      reactions: [{ watch: ['quantity', 'unitPrice'], fulfill: { run: (field: any, ctx: any) => { const q = (ctx.values.quantity as number) ?? 0; const p = (ctx.values.unitPrice as number) ?? 0; field.setValue(Math.round(q * p * 100) / 100) } } }],
    },
    level: { type: 'string', label: '会员等级', component: 'Select', wrapper: 'FormItem', defaultValue: 'silver', enum: [{ label: '银牌', value: 'silver' }, { label: '金牌', value: 'gold' }, { label: '钻石', value: 'diamond' }] },
    discountRate: {
      type: 'number', label: '折扣率（%）', component: 'InputNumber', wrapper: 'FormItem', componentProps: { disabled: true }, description: '根据等级动态设置',
      reactions: [{ watch: 'level', fulfill: { run: (field: any, ctx: any) => { const map: Record<string, number> = { silver: 5, gold: 10, diamond: 20 }; field.setValue(map[ctx.values.level as string] ?? 0) } } }],
    },
  },
}
</script>
