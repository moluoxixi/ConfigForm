<template>
  <div>
    <h2>条件必填（Field 版）</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      开关控制必填 / 金额阈值 / 选择「其他」必填 / 多条件组合 - FormField + fieldProps 实现
    </p>
    <StatusTabs ref="st" v-slot="{ showResult }">
      <FormProvider :form="form">
          <FormField name="needInvoice" :field-props="{ label: '需要发票', component: 'Switch', description: '开启后抬头和税号必填' }" />
          <FormField name="invoiceTitle" :field-props="{ label: '发票抬头', component: 'Input', componentProps: { placeholder: '请输入发票抬头' } }" />
          <FormField name="invoiceTaxNo" :field-props="{ label: '纳税人识别号', component: 'Input', componentProps: { placeholder: '请输入纳税人识别号' } }" />
          <FormField name="amount" :field-props="{ label: '报销金额', required: true, component: 'InputNumber', description: `超 ${THRESHOLD.toLocaleString()} 需填审批人`, componentProps: { min: 0, step: 100, style: { width: '100%' } } }" />
          <FormField name="approver" :field-props="{ label: '审批人', component: 'Input', componentProps: { placeholder: '选填' } }" />
          <FormField name="leaveType" :field-props="{ label: '请假类型', required: true, component: 'Select', dataSource: LEAVE_TYPE_OPTIONS, componentProps: { placeholder: '请选择' } }" />
          <FormField name="leaveReason" :field-props="{ label: '请假原因', component: 'Textarea', componentProps: { placeholder: '选择其他时必填' } }" />
          <FormField name="isOverseas" :field-props="{ label: '海外出差', component: 'Switch' }" />
          <FormField name="travelDays" :field-props="{ label: '出差天数', component: 'InputNumber', componentProps: { min: 1, style: { width: '100%' } } }" />
          <FormField name="travelInsurance" :field-props="{ label: '保险单号', component: 'Input', description: '海外且>3天必填', componentProps: { placeholder: '请输入保险单号' } }" />
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

/** 金额阈值：超过此值需要填写审批人 */
const THRESHOLD = 10000

/** 请假类型选项 */
const LEAVE_TYPE_OPTIONS = [
  { label: '年假', value: 'annual' },
  { label: '事假', value: 'personal' },
  { label: '其他', value: 'other' },
]

// ========== 表单 ==========

const st = ref<InstanceType<typeof StatusTabs>>()

const form = useCreateForm({
  initialValues: { needInvoice: false, invoiceTitle: '', invoiceTaxNo: '', amount: 0, approver: '', leaveType: 'annual', leaveReason: '', isOverseas: false, travelDays: 1, travelInsurance: '' },
})

// ========== 条件必填联动 ==========

/** 开关「需要发票」→ 控制发票抬头和税号的必填状态 */
form.onFieldValueChange('needInvoice', (value: unknown) => {
  const need = value as boolean
  const titleField = form.getField('invoiceTitle')
  const taxNoField = form.getField('invoiceTaxNo')
  if (titleField) titleField.required = need
  if (taxNoField) taxNoField.required = need
})

/** 报销金额变化 → 超阈值时审批人必填 */
form.onFieldValueChange('amount', (value: unknown) => {
  const a = (value as number) ?? 0
  const field = form.getField('approver')
  if (!field) return
  field.required = a > THRESHOLD
  field.setComponentProps({ placeholder: a > THRESHOLD ? '必须填写审批人' : '选填' })
})

/** 请假类型变化 → 选择「其他」时原因必填 */
form.onFieldValueChange('leaveType', (value: unknown) => {
  const field = form.getField('leaveReason')
  if (field) field.required = value === 'other'
})

/** 计算保险单号是否必填（海外出差 && 天数>3） */
function updateTravelInsurance(): void {
  const field = form.getField('travelInsurance')
  if (!field) return
  const overseas = form.getField('isOverseas')?.value as boolean
  const days = (form.getField('travelDays')?.value as number) ?? 0
  field.required = overseas && days > 3
}

form.onFieldValueChange('isOverseas', () => updateTravelInsurance())
form.onFieldValueChange('travelDays', () => updateTravelInsurance())

/** 同步 StatusTabs 的 mode 到 form.pattern */
watch(() => st.value?.mode, (v) => {
  if (v)
    form.pattern = v as FieldPattern
}, { immediate: true })
</script>
