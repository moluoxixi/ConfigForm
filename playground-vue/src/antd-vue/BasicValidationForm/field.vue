<template>
  <div>
    <h2>必填与格式验证（Field 版）</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      required / email / phone / URL / pattern / min-max - FormField + fieldProps 实现
    </p>
    <StatusTabs ref="st" v-slot="{ showResult }">
      <FormProvider :form="form">
          <FormField name="username" :field-props="{ label: '用户名（必填）', required: true, component: 'Input', componentProps: { placeholder: '请输入' }, rules: [{ minLength: 3, maxLength: 20, message: '3-20 字符' }] }" />
          <FormField name="email" :field-props="{ label: '邮箱', required: true, component: 'Input', componentProps: { placeholder: '请输入邮箱' }, rules: [{ format: 'email', message: '无效邮箱' }] }" />
          <FormField name="phone" :field-props="{ label: '手机号', required: true, component: 'Input', componentProps: { placeholder: '11 位手机号' }, rules: [{ format: 'phone', message: '无效手机号' }] }" />
          <FormField name="website" :field-props="{ label: '个人网站', component: 'Input', componentProps: { placeholder: 'https://...' }, rules: [{ format: 'url', message: '无效 URL' }] }" />
          <FormField name="nickname" :field-props="{ label: '昵称', component: 'Input', componentProps: { placeholder: '2-10 字符' }, rules: [{ minLength: 2, message: '至少 2 字符' }, { maxLength: 10, message: '最多 10 字符' }] }" />
          <FormField name="age" :field-props="{ label: '年龄', required: true, component: 'InputNumber', rules: [{ min: 1, max: 150, message: '1-150' }] }" />
          <FormField name="zipCode" :field-props="{ label: '邮编', component: 'Input', componentProps: { placeholder: '6 位数字' }, rules: zipCodeRules }" />
          <FormField name="idCard" :field-props="{ label: '身份证号', component: 'Input', componentProps: { placeholder: '18 位' }, rules: idCardRules }" />
          <FormField name="password" :field-props="{ label: '密码', required: true, component: 'Password', componentProps: { placeholder: '8-32 位' }, rules: passwordRules }" />
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

// ========== 包含正则的验证规则（提取为常量） ==========

/** 邮编验证规则：6 位数字 */
const zipCodeRules = [{ pattern: /^\d{6}$/, message: '6 位数字' }]

/** 身份证验证规则：18 位（末位可为 X） */
const idCardRules = [{ pattern: /^\d{17}[\dX]$/i, message: '无效身份证' }]

/** 密码验证规则：长度 + 复杂度 */
const passwordRules = [
  { minLength: 8, maxLength: 32, message: '8-32 字符' },
  { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: '需含大小写和数字' },
]

// ========== 表单 ==========

const st = ref<InstanceType<typeof StatusTabs>>()

const form = useCreateForm({
  initialValues: { username: '', email: '', phone: '', website: '', nickname: '', age: undefined, zipCode: '', idCard: '', password: '' },
})

/** 同步 StatusTabs 的 mode 到 form.pattern */
watch(() => st.value?.mode, (v) => {
  if (v)
    form.pattern = v as FieldPattern
}, { immediate: true })
</script>
