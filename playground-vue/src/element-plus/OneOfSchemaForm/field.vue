<template>
  <div>
    <h2>oneOf/anyOf 条件 Schema</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">
      根据支付方式切换字段组合 — FormField + 条件渲染实现
    </p>
    <StatusTabs ref="st" v-slot="{ mode, showResult }">
      <FormProvider :form="form">
        <form @submit.prevent="handleSubmit(showResult)" novalidate>
          <FormField name="paymentType" :field-props="{ label: '支付方式', required: true, component: 'RadioGroup', dataSource: [{ label: '信用卡', value: 'credit_card' }, { label: '银行转账', value: 'bank_transfer' }, { label: '支付宝', value: 'alipay' }] }" />
          <!-- 信用卡字段 -->
          <template v-if="paymentType === 'credit_card'">
            <FormField name="cardNumber" :field-props="{ label: '卡号', required: true, component: 'Input', rules: [{ pattern: '^\\d{16,19}$', message: '请输入16-19位数字' }] }" />
            <FormField name="cardHolder" :field-props="{ label: '持卡人', required: true, component: 'Input' }" />
            <FormField name="expiryDate" :field-props="{ label: '有效期', required: true, component: 'Input', componentProps: { placeholder: 'MM/YY' } }" />
            <FormField name="cvv" :field-props="{ label: 'CVV', required: true, component: 'Password', rules: [{ pattern: '^\\d{3,4}$', message: '3-4位数字' }] }" />
          </template>
          <!-- 银行转账字段 -->
          <template v-if="paymentType === 'bank_transfer'">
            <FormField name="bankName" :field-props="{ label: '开户银行', required: true, component: 'Input' }" />
            <FormField name="accountNumber" :field-props="{ label: '账号', required: true, component: 'Input' }" />
            <FormField name="accountName" :field-props="{ label: '户名', required: true, component: 'Input' }" />
            <FormField name="swift" :field-props="{ label: 'SWIFT 代码', component: 'Input', componentProps: { placeholder: '国际汇款时填写' } }" />
          </template>
          <!-- 支付宝字段 -->
          <template v-if="paymentType === 'alipay'">
            <FormField name="alipayAccount" :field-props="{ label: '支付宝账号', required: true, component: 'Input', rules: [{ format: 'email', message: '请输入邮箱或手机号' }] }" />
            <FormField name="alipayName" :field-props="{ label: '真实姓名', required: true, component: 'Input' }" />
          </template>
          <!-- 公共字段 -->
          <FormField name="amount" :field-props="{ label: '支付金额', required: true, component: 'InputNumber', componentProps: { min: 0.01, style: 'width: 100%' } }" />
          <FormField name="remark" :field-props="{ label: '备注', component: 'Textarea' }" />
          <LayoutFormActions @reset="form.reset()" />
        </form>
      </FormProvider>
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
import type { FieldPattern } from '@moluoxixi/core'
import { LayoutFormActions, setupElementPlus, StatusTabs } from '@moluoxixi/ui-element-plus'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/vue'
/**
 * oneOf/anyOf 条件 Schema — Field 模式
 *
 * 使用 FormProvider + FormField + v-if 条件渲染实现。
 * 根据 paymentType 的值动态切换不同支付方式的字段组合。
 */
import { computed, ref, watch } from 'vue'

setupElementPlus()
const st = ref<InstanceType<typeof StatusTabs>>()

const form = useCreateForm({
  initialValues: { paymentType: 'credit_card', amount: 0, remark: '' },
})

/** 当前支付方式 */
const paymentType = computed(() => (form.getFieldValue('paymentType') as string) ?? 'credit_card')

/** 监听支付方式变化 */
form.onValuesChange(() => {
  /* 触发 Vue 重新计算 paymentType computed */
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
