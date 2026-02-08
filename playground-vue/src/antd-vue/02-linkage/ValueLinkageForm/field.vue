<template>
  <div>
    <h2>值联动（Field 版）</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      单向同步 / 格式转换 / 映射转换 / 多对一聚合 - FormField + fieldProps 实现
    </p>
    <StatusTabs ref="st" v-slot="{ showResult }">
      <FormProvider :form="form">
          <FormField name="firstName" :field-props="{ label: '姓', component: 'Input', componentProps: { placeholder: '请输入姓' } }" />
          <FormField name="lastName" :field-props="{ label: '名', component: 'Input', componentProps: { placeholder: '请输入名' } }" />
          <FormField name="fullName" :field-props="{ label: '全名（自动拼接）', component: 'Input', componentProps: { disabled: true } }" />
          <FormField name="rawInput" :field-props="{ label: '输入文本', component: 'Input', componentProps: { placeholder: '输入任意文本' } }" />
          <FormField name="upperCase" :field-props="{ label: '大写转换', component: 'Input', componentProps: { disabled: true } }" />
          <FormField name="trimmed" :field-props="{ label: '去空格', component: 'Input', componentProps: { disabled: true } }" />
          <FormField name="country" :field-props="{ label: '国家', component: 'Select', dataSource: COUNTRY_OPTIONS, componentProps: { placeholder: '请选择国家' } }" />
          <FormField name="areaCode" :field-props="{ label: '区号（自动）', component: 'Input', componentProps: { disabled: true } }" />
          <FormField name="currency" :field-props="{ label: '货币（自动）', component: 'Input', componentProps: { disabled: true } }" />
          <FormField name="province" :field-props="{ label: '省', component: 'Input', componentProps: { placeholder: '省' } }" />
          <FormField name="city" :field-props="{ label: '市', component: 'Input', componentProps: { placeholder: '市' } }" />
          <FormField name="district" :field-props="{ label: '区', component: 'Input', componentProps: { placeholder: '区' } }" />
          <FormField name="fullAddress" :field-props="{ label: '完整地址（聚合）', component: 'Input', componentProps: { disabled: true } }" />
          <LayoutFormActions @submit="showResult" @submit-failed="(e: any) => st?.showErrors(e)" />
      </FormProvider>
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
import type { FieldPattern } from '@moluoxixi/core'
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
  { label: '韩国', value: 'korea' },
  { label: '英国', value: 'uk' },
]

/** 国家 → 区号映射 */
const COUNTRY_CODE: Record<string, string> = { china: '+86', usa: '+1', japan: '+81', korea: '+82', uk: '+44' }

/** 国家 → 货币映射 */
const COUNTRY_CURRENCY: Record<string, string> = { china: 'CNY', usa: 'USD', japan: 'JPY', korea: 'KRW', uk: 'GBP' }

// ========== 表单 ==========

const st = ref<InstanceType<typeof StatusTabs>>()

const form = useCreateForm({
  initialValues: { firstName: '', lastName: '', fullName: '', rawInput: '', upperCase: '', trimmed: '', country: 'china', areaCode: '+86', currency: 'CNY', province: '', city: '', district: '', fullAddress: '' },
})

// ========== 值联动 ==========

/** 姓/名 → 自动拼接全名 */
function computeFullName(): void {
  const first = (form.getField('firstName')?.value as string) ?? ''
  const last = (form.getField('lastName')?.value as string) ?? ''
  form.getField('fullName')?.setValue(`${first}${last}`.trim())
}

form.onFieldValueChange('firstName', () => computeFullName())
form.onFieldValueChange('lastName', () => computeFullName())

/** 输入文本 → 大写转换 + 去空格 */
form.onFieldValueChange('rawInput', (value: unknown) => {
  const raw = (value as string) ?? ''
  form.getField('upperCase')?.setValue(raw.toUpperCase())
  form.getField('trimmed')?.setValue(raw.trim())
})

/** 国家 → 自动设置区号和货币 */
form.onFieldValueChange('country', (value: unknown) => {
  const c = value as string
  form.getField('areaCode')?.setValue(COUNTRY_CODE[c] ?? '')
  form.getField('currency')?.setValue(COUNTRY_CURRENCY[c] ?? '')
})

/** 省/市/区 → 聚合完整地址 */
function computeFullAddress(): void {
  const province = (form.getField('province')?.value as string) ?? ''
  const city = (form.getField('city')?.value as string) ?? ''
  const district = (form.getField('district')?.value as string) ?? ''
  form.getField('fullAddress')?.setValue([province, city, district].filter(Boolean).join(' '))
}

form.onFieldValueChange('province', () => computeFullAddress())
form.onFieldValueChange('city', () => computeFullAddress())
form.onFieldValueChange('district', () => computeFullAddress())

/** 同步 StatusTabs 的 mode 到 form.pattern */
watch(() => st.value?.mode, (v) => {
  if (v)
    form.pattern = v as FieldPattern
}, { immediate: true })

</script>
