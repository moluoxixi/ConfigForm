<template>
  <div>
    <h2>默认值（Field 版）</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      静态 defaultValue / 动态计算默认值 / initialValues 注入 - FormField + fieldProps 实现
    </p>
    <StatusTabs ref="st" v-slot="{ showResult }">
      <FormProvider :form="form">
          <FormField name="country" :field-props="{ label: '国家', component: 'Select', description: '静态默认值', dataSource: COUNTRY_OPTIONS, componentProps: { placeholder: '请选择国家' } }" />
          <FormField name="status" :field-props="{ label: '状态', component: 'RadioGroup', dataSource: STATUS_OPTIONS }" />
          <FormField name="enableNotify" :field-props="{ label: '开启通知', component: 'Switch' }" />
          <FormField name="quantity" :field-props="{ label: '数量', component: 'InputNumber', componentProps: { min: 1 } }" />
          <FormField name="unitPrice" :field-props="{ label: '单价', component: 'InputNumber', componentProps: { min: 0, step: 0.1 } }" />
          <FormField name="totalPrice" :field-props="{ label: '总价（自动计算）', component: 'InputNumber', description: '数量 × 单价', componentProps: { disabled: true } }" />
          <FormField name="level" :field-props="{ label: '会员等级', component: 'Select', dataSource: LEVEL_OPTIONS, componentProps: { placeholder: '请选择等级' } }" />
          <FormField name="discountRate" :field-props="{ label: '折扣率（%）', component: 'InputNumber', description: '根据等级动态设置', componentProps: { disabled: true } }" />
          <LayoutFormActions @submit="showResult" @submit-failed="(e: any) => st?.showErrors(e)" />
      </FormProvider>
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
import type { FieldPattern } from '@moluoxixi/shared'
import { LayoutFormActions, setupAntdVue, StatusTabs } from '@moluoxixi/ui-antd-vue'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/vue'
import { ref, watch } from 'vue'

setupAntdVue()

// ========== 数据 ==========

/** 国家选项 */
const COUNTRY_OPTIONS = [
  { label: '中国', value: 'china' },
  { label: '美国', value: 'usa' },
  { label: '日本', value: 'japan' },
]

/** 状态选项 */
const STATUS_OPTIONS = [
  { label: '草稿', value: 'draft' },
  { label: '发布', value: 'published' },
]

/** 等级选项 */
const LEVEL_OPTIONS = [
  { label: '银牌', value: 'silver' },
  { label: '金牌', value: 'gold' },
  { label: '钻石', value: 'diamond' },
]

/** 等级 → 折扣率映射 */
const LEVEL_DISCOUNT_MAP: Record<string, number> = { silver: 5, gold: 10, diamond: 20 }

// ========== 表单 ==========

const st = ref<InstanceType<typeof StatusTabs>>()

const form = useCreateForm({
  initialValues: { country: 'china', status: 'draft', enableNotify: true, quantity: 1, unitPrice: 99.9, totalPrice: 99.9, level: 'silver', discountRate: 5 },
})

// ========== 计算联动 ==========

/** 计算总价 = 数量 × 单价 */
function computeTotalPrice(): void {
  const field = form.getField('totalPrice')
  if (!field) return
  const q = (form.getField('quantity')?.value as number) ?? 0
  const p = (form.getField('unitPrice')?.value as number) ?? 0
  field.setValue(Math.round(q * p * 100) / 100)
}

form.onFieldValueChange('quantity', () => computeTotalPrice())
form.onFieldValueChange('unitPrice', () => computeTotalPrice())

/** 等级变化 → 自动设置折扣率 */
form.onFieldValueChange('level', (value: unknown) => {
  const field = form.getField('discountRate')
  if (!field) return
  field.setValue(LEVEL_DISCOUNT_MAP[value as string] ?? 0)
})

/** 同步 StatusTabs 的 mode 到 form.pattern */
watch(() => st.value?.mode, (v) => {
  if (v)
    form.pattern = v as FieldPattern
}, { immediate: true })
</script>
