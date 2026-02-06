<template>
  <div>
    <h2>计算字段</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">乘法（单价×数量） / 百分比 / 聚合 / 条件计算</p>
    <ASegmented v-model:value="mode" :options="MODE_OPTIONS" style="margin-bottom: 16px" />
    <ConfigForm :key="mode" :schema="schema" :initial-values="savedValues" @values-change="(v: Record<string, unknown>) => savedValues = v" @submit="(v: Record<string, unknown>) => result = JSON.stringify(v, null, 2)" @submit-failed="(e: any[]) => result = '验证失败:\n' + e.map((x: any) => `[${x.path}] ${x.message}`).join('\n')">
      <template #default="{ form }"><ADivider /><ASpace v-if="mode === 'editable'"><AButton type="primary" html-type="submit">提交</AButton><AButton @click="form.reset()">重置</AButton></ASpace></template>
    </ConfigForm>
    <AAlert v-if="result" :type="result.startsWith('验证失败') ? 'error' : 'success'" message="提交结果" style="margin-top: 16px"><template #description><pre style="margin: 0; white-space: pre-wrap">{{ result }}</pre></template></AAlert>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ConfigForm } from '@moluoxixi/vue'
import { setupAntdVue } from '@moluoxixi/ui-antd-vue'
import { Button as AButton, Space as ASpace, Alert as AAlert, Segmented as ASegmented, Divider as ADivider } from 'ant-design-vue'
import type { FormSchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/shared'

setupAntdVue()
const MODE_OPTIONS = [{ label: '编辑态', value: 'editable' }, { label: '阅读态', value: 'readOnly' }, { label: '禁用态', value: 'disabled' }]
const mode = ref<FieldPattern>('editable')
const result = ref('')
const savedValues = ref<Record<string, unknown>>({ unitPrice: 100, quantity: 1, totalPrice: 100, originalPrice: 500, discountRate: 10, discountedPrice: 450, scoreA: 85, scoreB: 90, scoreC: 78, totalScore: 253, avgScore: 84.33, calcType: 'inclusive', amount: 1000, taxAmount: 115.04 })

const schema = computed<FormSchema>(() => ({
  form: { labelPosition: 'right', labelWidth: '150px', pattern: mode.value },
  fields: {
    unitPrice: { type: 'number', label: '单价（元）', component: 'InputNumber', wrapper: 'FormItem', defaultValue: 100, componentProps: { min: 0, step: 0.01, style: { width: '100%' } } },
    quantity: { type: 'number', label: '数量', component: 'InputNumber', wrapper: 'FormItem', defaultValue: 1, componentProps: { min: 1, step: 1, style: { width: '100%' } } },
    totalPrice: { type: 'number', label: '总价（自动）', component: 'InputNumber', wrapper: 'FormItem', componentProps: { disabled: true, style: { width: '100%' } }, description: '单价 × 数量', reactions: [{ watch: ['unitPrice', 'quantity'], fulfill: { run: (f: any, ctx: any) => { f.setValue(Math.round(((ctx.values.unitPrice as number) ?? 0) * ((ctx.values.quantity as number) ?? 0) * 100) / 100) } } }] },
    originalPrice: { type: 'number', label: '原价', component: 'InputNumber', wrapper: 'FormItem', defaultValue: 500, componentProps: { min: 0, style: { width: '100%' } } },
    discountRate: { type: 'number', label: '折扣率（%）', component: 'InputNumber', wrapper: 'FormItem', defaultValue: 10, componentProps: { min: 0, max: 100, style: { width: '100%' } } },
    discountedPrice: { type: 'number', label: '折后价（自动）', component: 'InputNumber', wrapper: 'FormItem', componentProps: { disabled: true, style: { width: '100%' } }, reactions: [{ watch: ['originalPrice', 'discountRate'], fulfill: { run: (f: any, ctx: any) => { f.setValue(Math.round(((ctx.values.originalPrice as number) ?? 0) * (1 - ((ctx.values.discountRate as number) ?? 0) / 100) * 100) / 100) } } }] },
    scoreA: { type: 'number', label: '科目 A', component: 'InputNumber', wrapper: 'FormItem', defaultValue: 85, componentProps: { min: 0, max: 100, style: { width: '100%' } } },
    scoreB: { type: 'number', label: '科目 B', component: 'InputNumber', wrapper: 'FormItem', defaultValue: 90, componentProps: { min: 0, max: 100, style: { width: '100%' } } },
    scoreC: { type: 'number', label: '科目 C', component: 'InputNumber', wrapper: 'FormItem', defaultValue: 78, componentProps: { min: 0, max: 100, style: { width: '100%' } } },
    totalScore: { type: 'number', label: '总分（自动）', component: 'InputNumber', wrapper: 'FormItem', componentProps: { disabled: true, style: { width: '100%' } }, reactions: [{ watch: ['scoreA', 'scoreB', 'scoreC'], fulfill: { run: (f: any, ctx: any) => { f.setValue(((ctx.values.scoreA as number) ?? 0) + ((ctx.values.scoreB as number) ?? 0) + ((ctx.values.scoreC as number) ?? 0)) } } }] },
    avgScore: { type: 'number', label: '平均分（自动）', component: 'InputNumber', wrapper: 'FormItem', componentProps: { disabled: true, style: { width: '100%' } }, reactions: [{ watch: ['scoreA', 'scoreB', 'scoreC'], fulfill: { run: (f: any, ctx: any) => { const sum = ((ctx.values.scoreA as number) ?? 0) + ((ctx.values.scoreB as number) ?? 0) + ((ctx.values.scoreC as number) ?? 0); f.setValue(Math.round(sum / 3 * 100) / 100) } } }] },
    calcType: { type: 'string', label: '计税方式', component: 'RadioGroup', wrapper: 'FormItem', defaultValue: 'inclusive', enum: [{ label: '含税 13%', value: 'inclusive' }, { label: '不含税', value: 'exclusive' }] },
    amount: { type: 'number', label: '金额', component: 'InputNumber', wrapper: 'FormItem', defaultValue: 1000, componentProps: { min: 0, style: { width: '100%' } } },
    taxAmount: { type: 'number', label: '税额（自动）', component: 'InputNumber', wrapper: 'FormItem', componentProps: { disabled: true, style: { width: '100%' } }, reactions: [{ watch: ['calcType', 'amount'], fulfill: { run: (f: any, ctx: any) => { const t = ctx.values.calcType as string; const a = (ctx.values.amount as number) ?? 0; f.setValue(t === 'inclusive' ? Math.round(a / 1.13 * 0.13 * 100) / 100 : Math.round(a * 0.13 * 100) / 100) } } }] },
  },
}))
</script>
