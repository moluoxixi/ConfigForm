<template>
  <div>
    <h2>折叠分组表单（Field 版）</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">
      使用 Collapse 进行表单分组 - FormField + ElCollapse 实现
    </p>
    <StatusTabs ref="st" v-slot="{ showResult }">
      <FormProvider :form="form">
          <el-collapse v-model="activeNames">
            <el-collapse-item title="基本信息" name="basic">
              <FormField name="name" :field-props="{ label: '姓名', required: true, component: 'Input', componentProps: { placeholder: '请输入姓名' } }" />
              <FormField name="gender" :field-props="{ label: '性别', component: 'RadioGroup', dataSource: GENDER_OPTIONS }" />
              <FormField name="age" :field-props="{ label: '年龄', component: 'InputNumber', componentProps: { min: 0, max: 150 } }" />
            </el-collapse-item>
            <el-collapse-item title="联系方式" name="contact">
              <FormField name="phone" :field-props="{ label: '手机号', component: 'Input', rules: [{ format: 'phone', message: '无效手机号' }], componentProps: { placeholder: '请输入手机号' } }" />
              <FormField name="email" :field-props="{ label: '邮箱', component: 'Input', rules: [{ format: 'email', message: '无效邮箱' }], componentProps: { placeholder: '请输入邮箱' } }" />
              <FormField name="address" :field-props="{ label: '地址', component: 'Textarea', componentProps: { placeholder: '请输入地址', rows: 2 } }" />
            </el-collapse-item>
            <el-collapse-item title="工作信息" name="work">
              <FormField name="company" :field-props="{ label: '公司', component: 'Input', componentProps: { placeholder: '请输入公司名称' } }" />
              <FormField name="position" :field-props="{ label: '职位', component: 'Input', componentProps: { placeholder: '请输入职位' } }" />
              <FormField name="salary" :field-props="{ label: '薪资', component: 'InputNumber', componentProps: { min: 0, step: 1000 } }" />
            </el-collapse-item>
          </el-collapse>
          <LayoutFormActions @submit="showResult" @submit-failed="(e: any) => st?.showErrors(e)" />
      </FormProvider>
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
/**
 * 折叠分组表单 — Field 模式（Element Plus）
 *
 * 使用 ElCollapse 将表单字段分组展示。
 */
import type { FieldPattern } from '@moluoxixi/core'
import { LayoutFormActions, setupElementPlus, StatusTabs } from '@moluoxixi/ui-element-plus'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/vue'
import { ref, watch } from 'vue'

setupElementPlus()

const st = ref<InstanceType<typeof StatusTabs>>()

/** 当前展开的面板 */
const activeNames = ref(['basic', 'contact'])

/** 性别选项 */
const GENDER_OPTIONS = [
  { label: '男', value: 'male' },
  { label: '女', value: 'female' },
]

const form = useCreateForm({
  initialValues: {
    name: '',
    gender: 'male',
    age: 18,
    phone: '',
    email: '',
    address: '',
    company: '',
    position: '',
    salary: 0,
  },
})

/** 同步 StatusTabs 的 mode 到 form.pattern */
watch(() => st.value?.mode, (v) => {
  if (v)
    form.pattern = v as FieldPattern
}, { immediate: true })
</script>
