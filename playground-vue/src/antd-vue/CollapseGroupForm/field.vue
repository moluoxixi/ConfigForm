<template>
  <div>
    <h2>折叠面板分组（Field 版）</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      Collapse 分组 / void 节点布局 - FormField + fieldProps 实现
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
            <FormField name="company" :field-props="{ label: '公司', component: 'Input', componentProps: { placeholder: '请输入公司' } }" />
            <FormField name="position" :field-props="{ label: '职位', component: 'Input', componentProps: { placeholder: '请输入职位' } }" />
            <FormField name="salary" :field-props="{ label: '薪资', component: 'InputNumber', componentProps: { min: 0, style: { width: '100%' } } }" />
          </ACard>
          <ACard title="教育经历" style="margin-bottom: 16px">
            <FormField name="school" :field-props="{ label: '学校', component: 'Input', componentProps: { placeholder: '请输入学校' } }" />
            <FormField name="major" :field-props="{ label: '专业', component: 'Input', componentProps: { placeholder: '请输入专业' } }" />
            <FormField name="degree" :field-props="{ label: '学历', component: 'Select', dataSource: DEGREE_OPTIONS, componentProps: { placeholder: '请选择学历' } }" />
          </ACard>
          <ACard title="其他" style="margin-bottom: 16px">
            <FormField name="bio" :field-props="{ label: '简介', component: 'Textarea', componentProps: { placeholder: '请输入简介' } }" />
            <FormField name="hobby" :field-props="{ label: '爱好', component: 'Input', componentProps: { placeholder: '请输入爱好' } }" />
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

/** 学历选项 */
const DEGREE_OPTIONS = [
  { label: '本科', value: 'bachelor' },
  { label: '硕士', value: 'master' },
  { label: '博士', value: 'phd' },
]

// ========== 表单 ==========

const st = ref<InstanceType<typeof StatusTabs>>()

const form = useCreateForm({
  initialValues: { name: '', email: '', phone: '', company: '', position: '', salary: undefined, school: '', major: '', degree: undefined, bio: '', hobby: '' },
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
