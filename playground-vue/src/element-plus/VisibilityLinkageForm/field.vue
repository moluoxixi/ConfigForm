<template>
  <div>
    <h2>显隐联动（Field 版）</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">
      根据表单值动态控制字段显隐 - FormField + watch 实现
    </p>
    <StatusTabs ref="st" v-slot="{ showResult }">
      <FormProvider :form="form">
          <FormField name="hasCompany" :field-props="{ label: '是否有公司', component: 'Switch' }" />
          <FormField v-if="showCompanyFields" name="companyName" :field-props="{ label: '公司名称', required: true, component: 'Input', componentProps: { placeholder: '请输入公司名称' } }" />
          <FormField v-if="showCompanyFields" name="companyAddress" :field-props="{ label: '公司地址', component: 'Input', componentProps: { placeholder: '请输入公司地址' } }" />
          <FormField name="contactType" :field-props="{ label: '联系方式', component: 'RadioGroup', dataSource: CONTACT_OPTIONS }" />
          <FormField v-if="contactType === 'phone'" name="phone" :field-props="{ label: '手机号', required: true, component: 'Input', rules: [{ format: 'phone', message: '无效手机号' }], componentProps: { placeholder: '请输入手机号' } }" />
          <FormField v-if="contactType === 'email'" name="email" :field-props="{ label: '邮箱', required: true, component: 'Input', rules: [{ format: 'email', message: '无效邮箱' }], componentProps: { placeholder: '请输入邮箱' } }" />
          <FormField v-if="contactType === 'wechat'" name="wechat" :field-props="{ label: '微信号', required: true, component: 'Input', componentProps: { placeholder: '请输入微信号' } }" />
          <LayoutFormActions @submit="showResult" @submit-failed="(e: any) => st?.showErrors(e)" />
      </FormProvider>
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
/**
 * 显隐联动 — Field 模式（Element Plus）
 *
 * 展示字段显隐联动：
 * - Switch 控制一组字段显隐
 * - RadioGroup 控制互斥字段显隐
 */
import type { FieldPattern } from '@moluoxixi/shared'
import { LayoutFormActions, setupElementPlus, StatusTabs } from '@moluoxixi/ui-element-plus'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/vue'
import { computed, ref, watch } from 'vue'

setupElementPlus()

const st = ref<InstanceType<typeof StatusTabs>>()

/** 联系方式选项 */
const CONTACT_OPTIONS = [
  { label: '手机', value: 'phone' },
  { label: '邮箱', value: 'email' },
  { label: '微信', value: 'wechat' },
]

const form = useCreateForm({
  initialValues: {
    hasCompany: false,
    companyName: '',
    companyAddress: '',
    contactType: 'phone',
    phone: '',
    email: '',
    wechat: '',
  },
})

/** 是否显示公司相关字段 */
const showCompanyFields = computed(() => form.getFieldValue('hasCompany') as boolean)

/** 当前选择的联系方式 */
const contactType = computed(() => form.getFieldValue('contactType') as string)

/** 同步 StatusTabs 的 mode 到 form.pattern */
watch(() => st.value?.mode, (v) => {
  if (v)
    form.pattern = v as FieldPattern
}, { immediate: true })

</script>
