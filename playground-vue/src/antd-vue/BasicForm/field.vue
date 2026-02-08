<template>
  <div>
    <h2>基础表单（Field 版）</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      FormField + fieldProps 声明式渲染 · component / wrapper 自动查找 · 三态自动处理
    </p>
    <StatusTabs ref="st" v-slot="{ showResult }">
      <FormProvider :form="form">
        <FormField name="username" :field-props="{ label: '用户名', required: true, component: 'Input', rules: [{ minLength: 3, maxLength: 20, message: '3-20 个字符' }], componentProps: { placeholder: '请输入用户名' } }" />
        <FormField name="password" :field-props="{ label: '密码', required: true, component: 'Password', rules: [{ minLength: 8, message: '至少 8 个字符' }], componentProps: { placeholder: '请输入密码' } }" />
        <FormField name="email" :field-props="{ label: '邮箱', required: true, component: 'Input', rules: [{ format: 'email', message: '邮箱格式不正确' }], componentProps: { placeholder: '请输入邮箱' } }" />
        <FormField name="phone" :field-props="{ label: '手机号', component: 'Input', rules: [{ format: 'phone', message: '手机号格式不正确' }], componentProps: { placeholder: '请输入手机号' } }" />
        <FormField name="age" :field-props="{ label: '年龄', required: true, component: 'InputNumber', componentProps: { min: 0, max: 150, style: 'width: 100%' } }" />
        <FormField name="gender" :field-props="{ label: '性别', component: 'Select', dataSource: GENDER_OPTIONS, componentProps: { placeholder: '请选择性别', allowClear: true } }" />
        <FormField name="marital" :field-props="{ label: '婚姻状况', component: 'RadioGroup', dataSource: MARITAL_OPTIONS }" />
        <FormField name="hobbies" :field-props="{ label: '爱好', component: 'CheckboxGroup', dataSource: HOBBY_OPTIONS }" />
        <FormField name="notification" :field-props="{ label: '开启通知', component: 'Switch' }" />
        <FormField name="birthday" :field-props="{ label: '生日', component: 'DatePicker', componentProps: { style: 'width: 100%' } }" />
        <FormField name="bio" :field-props="{ label: '个人简介', component: 'Textarea', rules: [{ maxLength: 200, message: '最多 200 字' }], componentProps: { placeholder: '请输入简介', rows: 3 } }" />
        <LayoutFormActions @submit="showResult" @submit-failed="(e: any) => st?.showErrors(e)" />
      </FormProvider>
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
/**
 * 场景 1：基础表单 - Field 版（Ant Design Vue）
 *
 * 使用 FormProvider + FormField 声明式渲染，等价 Formily 的 Field 模式。
 * 通过 FormField 的 fieldProps 配置字段，ReactiveField 自动处理组件查找和三态。
 * 提交/重置由 LayoutFormActions 自动处理，无需 <form> 标签和手动 submit。
 */
import type { FieldPattern } from '@moluoxixi/core'
import { LayoutFormActions, setupAntdVue, StatusTabs } from '@moluoxixi/ui-antd-vue'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/vue'
import { ref, watch } from 'vue'

setupAntdVue()

const st = ref<InstanceType<typeof StatusTabs>>()

const GENDER_OPTIONS = [{ label: '男', value: 'male' }, { label: '女', value: 'female' }]
const MARITAL_OPTIONS = [{ label: '未婚', value: 'single' }, { label: '已婚', value: 'married' }]
const HOBBY_OPTIONS = [{ label: '阅读', value: 'reading' }, { label: '运动', value: 'sports' }, { label: '编程', value: 'coding' }]

const form = useCreateForm({
  initialValues: {
    username: '', password: '', email: '', phone: '',
    age: 18, gender: undefined, marital: 'single',
    hobbies: [] as string[], notification: true,
    birthday: '', bio: '',
  },
})

watch(() => st.value?.mode, (v) => {
  if (v) form.pattern = v as FieldPattern
}, { immediate: true })
</script>
