<template>
  <div>
    <h2>Grid 栅格布局</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      CSS Grid 栅格布局 — FormField + grid 样式实现
    </p>
    <StatusTabs ref="st" v-slot="{ mode, showResult }">
      <FormProvider :form="form">
        <form @submit.prevent="handleSubmit(showResult)" novalidate>
          <div style="display: grid; grid-template-columns: repeat(24, 1fr); gap: 16px">
            <!-- span 12 + 12 -->
            <div style="grid-column: span 12">
              <FormField name="firstName" :field-props="{ label: '姓', required: true, component: 'Input', componentProps: { placeholder: '请输入姓氏' } }" />
            </div>
            <div style="grid-column: span 12">
              <FormField name="lastName" :field-props="{ label: '名', required: true, component: 'Input', componentProps: { placeholder: '请输入名字' } }" />
            </div>
            <!-- span 16 + 8 -->
            <div style="grid-column: span 16">
              <FormField name="email" :field-props="{ label: '邮箱', component: 'Input', rules: [{ format: 'email', message: '请输入有效邮箱' }], componentProps: { placeholder: 'user@example.com' } }" />
            </div>
            <div style="grid-column: span 8">
              <FormField name="age" :field-props="{ label: '年龄', component: 'InputNumber', componentProps: { min: 0, max: 150, style: 'width: 100%' } }" />
            </div>
            <!-- span 24 -->
            <div style="grid-column: span 24">
              <FormField name="address" :field-props="{ label: '详细地址', component: 'Textarea', componentProps: { placeholder: '请输入详细地址', rows: 2 } }" />
            </div>
            <!-- span 8 + 8 + 8 -->
            <div style="grid-column: span 8">
              <FormField name="province" :field-props="{ label: '省份', component: 'Select', dataSource: [{ label: '北京', value: 'beijing' }, { label: '上海', value: 'shanghai' }, { label: '广东', value: 'guangdong' }] }" />
            </div>
            <div style="grid-column: span 8">
              <FormField name="city" :field-props="{ label: '城市', component: 'Input', componentProps: { placeholder: '请输入城市' } }" />
            </div>
            <div style="grid-column: span 8">
              <FormField name="zipCode" :field-props="{ label: '邮编', component: 'Input', componentProps: { placeholder: '100000' } }" />
            </div>
            <!-- span 12 + 12 -->
            <div style="grid-column: span 12">
              <FormField name="phone" :field-props="{ label: '手机号', component: 'Input', rules: [{ format: 'phone', message: '请输入有效手机号' }] }" />
            </div>
            <div style="grid-column: span 12">
              <FormField name="notification" :field-props="{ label: '接收通知', component: 'Switch' }" />
            </div>
          </div>
          <LayoutFormActions v-if="mode === 'editable'" @reset="form.reset()" />
        </form>
      </FormProvider>
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
import type { FieldPattern } from '@moluoxixi/shared'
import { LayoutFormActions, setupAntdVue, StatusTabs } from '@moluoxixi/ui-antd-vue'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/vue'
/**
 * Grid 栅格布局 — Field 模式
 *
 * 使用 FormProvider + FormField + CSS Grid 实现栅格布局。
 * 24 列栅格，通过 grid-column: span N 控制字段宽度。
 */
import { ref, watch } from 'vue'

setupAntdVue()
const st = ref<InstanceType<typeof StatusTabs>>()

const form = useCreateForm({
  initialValues: {
    firstName: '',
    lastName: '',
    email: '',
    age: undefined,
    address: '',
    province: undefined,
    city: '',
    zipCode: '',
    phone: '',
    notification: false,
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
