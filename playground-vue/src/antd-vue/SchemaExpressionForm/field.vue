<template>
  <div>
    <h2>Schema 表达式</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      字段联动 / 条件显隐 / 自动计算 — FormField + watch 实现
    </p>
    <StatusTabs ref="st" v-slot="{ mode, showResult }">
      <FormProvider :form="form">
        <form @submit.prevent="handleSubmit(showResult)" novalidate>
          <FormField name="orderType" :field-props="{ label: '订单类型', component: 'Select', dataSource: [{ label: '普通订单', value: 'normal' }, { label: '加急订单', value: 'urgent' }, { label: 'VIP 订单', value: 'vip' }] }" />
          <FormField name="amount" :field-props="{ label: '订单金额', required: true, component: 'InputNumber', componentProps: { min: 0, style: 'width: 100%' } }" />
          <!-- 加急费用：仅加急订单显示 -->
          <FormField v-if="isUrgent" name="urgentFee" :field-props="{ label: '加急费用', component: 'InputNumber', componentProps: { min: 0, style: 'width: 100%' } }" />
          <!-- 总额：自动计算 -->
          <FormField name="totalAmount" :field-props="{ label: '订单总额（自动计算）', component: 'InputNumber', disabled: true, componentProps: { style: 'width: 100%' } }" />
          <FormField name="needInvoice" :field-props="{ label: '需要发票', component: 'Switch' }" />
          <!-- 发票信息：仅需要发票时显示 -->
          <template v-if="needInvoice">
            <FormField name="invoiceTitle" :field-props="{ label: '发票抬头', required: true, component: 'Input' }" />
            <FormField name="invoiceType" :field-props="{ label: '发票类型', component: 'RadioGroup', dataSource: [{ label: '个人', value: 'personal' }, { label: '企业', value: 'company' }] }" />
            <FormField v-if="isCompanyInvoice" name="taxNumber" :field-props="{ label: '税号', required: true, component: 'Input', componentProps: { placeholder: '请输入税号' } }" />
          </template>
          <LayoutFormActions v-if="mode === 'editable'" @reset="form.reset()" />
        </form>
      </FormProvider>
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
import type { FieldPattern } from '@moluoxixi/shared'
import { createForm } from '@moluoxixi/core'
import { LayoutFormActions, setupAntdVue, StatusTabs } from '@moluoxixi/ui-antd-vue'
import { FormField, FormProvider } from '@moluoxixi/vue'
/**
 * Schema 表达式 — Field 模式
 *
 * 使用 FormProvider + FormField + createForm effects 实现字段联动。
 * 通过 onFieldValueChange 监听字段变化，实现条件显隐和自动计算。
 */
import { computed, ref, watch } from 'vue'

setupAntdVue()
const st = ref<InstanceType<typeof StatusTabs>>()

/** 响应式标记（用于模板条件渲染） */
const isUrgent = ref(false)
const needInvoice = ref(false)
const isCompanyInvoice = ref(false)

const form = createForm({
  initialValues: {
    orderType: 'normal',
    amount: 0,
    urgentFee: 0,
    totalAmount: 0,
    needInvoice: false,
    invoiceTitle: '',
    invoiceType: 'personal',
    taxNumber: '',
  },
  effects: (f) => {
    /* 订单类型 → 加急费用显隐 + 自动计算 */
    f.onFieldValueChange('orderType', (val) => {
      isUrgent.value = val === 'urgent'
      if (val !== 'urgent') {
        f.setFieldValue('urgentFee', 0)
      }
      else {
        f.setFieldValue('urgentFee', Math.round((f.getFieldValue('amount') as number ?? 0) * 0.2))
      }
    })

    /* 金额变化 → 重算总额 */
    f.onFieldValueChange('amount', (val) => {
      const urgentFee = f.getFieldValue('urgentFee') as number ?? 0
      f.setFieldValue('totalAmount', (val as number ?? 0) + urgentFee)
    })

    /* 加急费变化 → 重算总额 */
    f.onFieldValueChange('urgentFee', (val) => {
      const amount = f.getFieldValue('amount') as number ?? 0
      f.setFieldValue('totalAmount', amount + (val as number ?? 0))
    })

    /* 是否需要发票 */
    f.onFieldValueChange('needInvoice', (val) => {
      needInvoice.value = val === true
    })

    /* 发票类型 */
    f.onFieldValueChange('invoiceType', (val) => {
      isCompanyInvoice.value = val === 'company'
    })
  },
})

/** 同步 StatusTabs 的 mode 到 form.pattern */
watch(() => st.value?.mode, (v) => {
  if (v)
    form.pattern = v as FieldPattern
}, { immediate: true })

/** 提交处理 */
async function handleSubmit(showResult: (data: Record<string, unknown>) => void): Promise<void> {
  const res = await form.submit()
  if (res.errors.length > 0) {
    st.value?.showErrors(res.errors)
  }
  else {
    showResult(res.values)
  }
}
</script>
