<template>
  <div>
    <h2>表单布局（Field 版）</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      水平 / 垂直 / 行内 / 栅格布局 - FormField + fieldProps 实现
    </p>
    <div style="margin-bottom: 16px">
      <span style="font-weight: 600; margin-right: 12px">布局类型：</span>
      <div style="display: inline-flex; border: 1px solid #d9d9d9; border-radius: 6px; overflow: hidden">
        <button v-for="opt in LAYOUT_OPTIONS" :key="opt.value" :style="{ padding: '4px 12px', border: 'none', cursor: 'pointer', background: layoutType === opt.value ? '#1677ff' : '#fff', color: layoutType === opt.value ? '#fff' : 'inherit', fontSize: '14px' }" @click="layoutType = opt.value as LayoutType">
          {{ opt.label }}
        </button>
      </div>
    </div>
    <StatusTabs ref="st" v-slot="{ mode, showResult }">
      <FormProvider :form="form">
        <form @submit.prevent="handleSubmit(showResult)" novalidate>
          <div :style="wrapperStyle">
            <FormField name="name" :field-props="{ label: '姓名', required: true, component: 'Input', componentProps: { placeholder: '请输入姓名' } }" />
            <FormField name="email" :field-props="{ label: '邮箱', required: true, component: 'Input', componentProps: { placeholder: '请输入邮箱' }, rules: [{ format: 'email', message: '无效邮箱' }] }" />
            <FormField name="phone" :field-props="{ label: '手机号', component: 'Input', componentProps: { placeholder: '请输入手机号' } }" />
            <FormField name="department" :field-props="{ label: '部门', component: 'Select', dataSource: DEPARTMENT_OPTIONS, componentProps: { placeholder: '请选择' } }" />
            <FormField name="role" :field-props="{ label: '职位', component: 'Input', componentProps: { placeholder: '请输入职位' } }" />
            <FormField name="joinDate" :field-props="{ label: '入职日期', component: 'DatePicker' }" />
          </div>
          <LayoutFormActions @reset="form.reset()" />
        </form>
      </FormProvider>
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
import type { FieldPattern } from '@moluoxixi/shared'
import { LayoutFormActions, setupAntdVue, StatusTabs } from '@moluoxixi/ui-antd-vue'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/vue'
import { computed, ref, watch } from 'vue'

setupAntdVue()

// ========== 数据 ==========

/** 布局选项 */
const LAYOUT_OPTIONS = [
  { label: '水平', value: 'horizontal' },
  { label: '垂直', value: 'vertical' },
  { label: '行内', value: 'inline' },
  { label: '栅格两列', value: 'grid-2col' },
]

type LayoutType = 'horizontal' | 'vertical' | 'inline' | 'grid-2col'

/** 部门选项 */
const DEPARTMENT_OPTIONS = [
  { label: '技术部', value: 'tech' },
  { label: '产品部', value: 'product' },
  { label: '设计部', value: 'design' },
]

// ========== 表单 ==========

const st = ref<InstanceType<typeof StatusTabs>>()
const layoutType = ref<LayoutType>('horizontal')

const form = useCreateForm({
  initialValues: { name: '', email: '', phone: '', department: undefined, role: '', joinDate: '' },
})

/** 根据布局类型计算容器样式 */
const wrapperStyle = computed<Record<string, string>>(() => {
  switch (layoutType.value) {
    case 'inline':
      return { display: 'flex', flexWrap: 'wrap', gap: '0 24px', alignItems: 'flex-start' }
    case 'grid-2col':
      return { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }
    default:
      return {}
  }
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
