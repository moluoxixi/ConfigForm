<template>
  <div>
    <h2>计算字段（Field 版）</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">
      乘法（单价×数量） / 百分比 / 聚合 / 条件计算 - FormField + fieldProps 实现
    </p>
    <StatusTabs ref="st" v-slot="{ showResult }">
      <FormProvider :form="form">
          <FormField name="unitPrice" :field-props="{ label: '单价（元）', component: 'InputNumber', componentProps: { min: 0, step: 0.01, style: { width: '100%' } } }" />
          <FormField name="quantity" :field-props="{ label: '数量', component: 'InputNumber', componentProps: { min: 1, step: 1, style: { width: '100%' } } }" />
          <FormField name="totalPrice" :field-props="{ label: '总价（自动）', component: 'InputNumber', description: '单价 × 数量', componentProps: { disabled: true, style: { width: '100%' } } }" />
          <FormField name="originalPrice" :field-props="{ label: '原价', component: 'InputNumber', componentProps: { min: 0, style: { width: '100%' } } }" />
          <FormField name="discountRate" :field-props="{ label: '折扣率（%）', component: 'InputNumber', componentProps: { min: 0, max: 100, style: { width: '100%' } } }" />
          <FormField name="discountedPrice" :field-props="{ label: '折后价（自动）', component: 'InputNumber', componentProps: { disabled: true, style: { width: '100%' } } }" />
          <FormField name="scoreA" :field-props="{ label: '科目 A', component: 'InputNumber', componentProps: { min: 0, max: 100, style: { width: '100%' } } }" />
          <FormField name="scoreB" :field-props="{ label: '科目 B', component: 'InputNumber', componentProps: { min: 0, max: 100, style: { width: '100%' } } }" />
          <FormField name="scoreC" :field-props="{ label: '科目 C', component: 'InputNumber', componentProps: { min: 0, max: 100, style: { width: '100%' } } }" />
          <FormField name="totalScore" :field-props="{ label: '总分（自动）', component: 'InputNumber', componentProps: { disabled: true, style: { width: '100%' } } }" />
          <FormField name="avgScore" :field-props="{ label: '平均分（自动）', component: 'InputNumber', componentProps: { disabled: true, style: { width: '100%' } } }" />
          <FormField name="calcType" :field-props="{ label: '计税方式', component: 'RadioGroup', dataSource: CALC_TYPE_OPTIONS }" />
          <FormField name="amount" :field-props="{ label: '金额', component: 'InputNumber', componentProps: { min: 0, style: { width: '100%' } } }" />
          <FormField name="taxAmount" :field-props="{ label: '税额（自动）', component: 'InputNumber', componentProps: { disabled: true, style: { width: '100%' } } }" />
          <LayoutFormActions @submit="showResult" @submit-failed="(e: any) => st?.showErrors(e)" />
      </FormProvider>
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
import type { FieldPattern } from '@moluoxixi/core'
import { LayoutFormActions, setupElementPlus, StatusTabs } from '@moluoxixi/ui-element-plus'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/vue'
import { ref, watch } from 'vue'

setupElementPlus()

// ========== 数据 ==========

/** 计税方式选项 */
const CALC_TYPE_OPTIONS = [
  { label: '含税 13%', value: 'inclusive' },
  { label: '不含税', value: 'exclusive' },
]

// ========== 表单 ==========

const st = ref<InstanceType<typeof StatusTabs>>()

const form = useCreateForm({
  initialValues: {
    unitPrice: 100, quantity: 1, totalPrice: 100,
    originalPrice: 500, discountRate: 10, discountedPrice: 450,
    scoreA: 85, scoreB: 90, scoreC: 78, totalScore: 253, avgScore: 84.33,
    calcType: 'inclusive', amount: 1000, taxAmount: 115.04,
  },
})

// ========== 计算函数 ==========

/** 计算总价 = 单价 × 数量 */
function computeTotalPrice(): void {
  const field = form.getField('totalPrice')
  if (!field) return
  const unitPrice = (form.getField('unitPrice')?.value as number) ?? 0
  const quantity = (form.getField('quantity')?.value as number) ?? 0
  field.setValue(Math.round(unitPrice * quantity * 100) / 100)
}

/** 计算折后价 = 原价 × (1 - 折扣率 / 100) */
function computeDiscountedPrice(): void {
  const field = form.getField('discountedPrice')
  if (!field) return
  const originalPrice = (form.getField('originalPrice')?.value as number) ?? 0
  const discountRate = (form.getField('discountRate')?.value as number) ?? 0
  field.setValue(Math.round(originalPrice * (1 - discountRate / 100) * 100) / 100)
}

/** 计算总分 + 平均分 */
function computeScores(): void {
  const a = (form.getField('scoreA')?.value as number) ?? 0
  const b = (form.getField('scoreB')?.value as number) ?? 0
  const c = (form.getField('scoreC')?.value as number) ?? 0
  const sum = a + b + c
  form.getField('totalScore')?.setValue(sum)
  form.getField('avgScore')?.setValue(Math.round(sum / 3 * 100) / 100)
}

/** 计算税额（含税: 金额/1.13*0.13，不含税: 金额*0.13） */
function computeTaxAmount(): void {
  const field = form.getField('taxAmount')
  if (!field) return
  const t = form.getField('calcType')?.value as string
  const a = (form.getField('amount')?.value as number) ?? 0
  field.setValue(t === 'inclusive'
    ? Math.round(a / 1.13 * 0.13 * 100) / 100
    : Math.round(a * 0.13 * 100) / 100)
}

// ========== 注册计算联动 ==========

form.onFieldValueChange('unitPrice', () => computeTotalPrice())
form.onFieldValueChange('quantity', () => computeTotalPrice())

form.onFieldValueChange('originalPrice', () => computeDiscountedPrice())
form.onFieldValueChange('discountRate', () => computeDiscountedPrice())

form.onFieldValueChange('scoreA', () => computeScores())
form.onFieldValueChange('scoreB', () => computeScores())
form.onFieldValueChange('scoreC', () => computeScores())

form.onFieldValueChange('calcType', () => computeTaxAmount())
form.onFieldValueChange('amount', () => computeTaxAmount())

/** 同步 StatusTabs 的 mode 到 form.pattern */
watch(() => st.value?.mode, (v) => {
  if (v)
    form.pattern = v as FieldPattern
}, { immediate: true })
</script>
