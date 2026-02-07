<template>
  <div>
    <h2>标签页切换分组（Field 版）</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      Tabs 分组 / 切换保留数据 / void 节点布局 - FormField + fieldProps 实现
    </p>
    <StatusTabs ref="st" v-slot="{ mode, showResult }">
      <FormProvider :form="form">
        <form @submit.prevent="handleSubmit(showResult)" novalidate>
          <ACard title="基本信息" style="margin-bottom: 16px">
            <FormField name="name" :field-props="{ label: '姓名', required: true, component: 'Input', componentProps: { placeholder: '请输入姓名' } }" />
            <FormField name="email" :field-props="{ label: '邮箱', required: true, component: 'Input', componentProps: { placeholder: '请输入邮箱' }, rules: [{ format: 'email', message: '无效邮箱' }] }" />
            <FormField name="phone" :field-props="{ label: '手机号', component: 'Input', componentProps: { placeholder: '请输入手机号' } }" />
          </ACard>
          <ACard title="工作信息" style="margin-bottom: 16px">
            <FormField name="company" :field-props="{ label: '公司', required: true, component: 'Input', componentProps: { placeholder: '请输入公司' } }" />
            <FormField name="position" :field-props="{ label: '职位', component: 'Input', componentProps: { placeholder: '请输入职位' } }" />
            <FormField name="department" :field-props="{ label: '部门', component: 'Select', dataSource: DEPARTMENT_OPTIONS, componentProps: { placeholder: '请选择' } }" />
          </ACard>
          <ACard title="其他" style="margin-bottom: 16px">
            <FormField name="bio" :field-props="{ label: '简介', component: 'Textarea', componentProps: { placeholder: '请输入简介' }, rules: [{ maxLength: 200, message: '不超过 200 字' }] }" />
            <FormField name="website" :field-props="{ label: '网站', component: 'Input', componentProps: { placeholder: '请输入网站' }, rules: [{ format: 'url', message: '无效 URL' }] }" />
            <FormField name="github" :field-props="{ label: 'GitHub', component: 'Input', componentProps: { placeholder: '请输入 GitHub' } }" />
          </ACard>
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
import { Card as ACard } from 'ant-design-vue'
import { ref, watch } from 'vue'

setupAntdVue()

// ========== 数据 ==========

/** 部门选项 */
const DEPARTMENT_OPTIONS = [
  { label: '技术', value: 'tech' },
  { label: '产品', value: 'product' },
]

// ========== 表单 ==========

const st = ref<InstanceType<typeof StatusTabs>>()

const form = useCreateForm({
  initialValues: { name: '', email: '', phone: '', company: '', position: '', department: undefined, bio: '', website: '', github: '' },
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
