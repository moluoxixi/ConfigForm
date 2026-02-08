<template>
  <div>
    <h2>自定义装饰器</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      自定义装饰器包裹字段 — FormField + 自定义 wrapper 实现
    </p>
    <StatusTabs ref="st" v-slot="{ mode, showResult }">
      <FormProvider :form="form">
        <form @submit.prevent="handleSubmit(showResult)" novalidate>
          <!-- 卡片装饰器包裹 -->
          <div style="border: 1px solid #e8e8e8; border-radius: 8px; padding: 16px; margin-bottom: 12px; background: #fafafa">
            <div style="font-weight: 600; font-size: 14px; margin-bottom: 8px">项目名称 <span style="color: #ff4d4f">*</span></div>
            <FormField name="projectName" :field-props="{ label: '项目名称', required: true, component: 'Input', componentProps: { placeholder: '请输入项目名称' } }" />
            <div style="color: #999; font-size: 12px; margin-top: 4px">请输入项目的完整名称</div>
          </div>
          <div style="border: 1px solid #e8e8e8; border-radius: 8px; padding: 16px; margin-bottom: 12px; background: #fafafa">
            <div style="font-weight: 600; font-size: 14px; margin-bottom: 8px">项目编号 <span style="color: #ff4d4f">*</span></div>
            <FormField name="projectCode" :field-props="{ label: '项目编号', required: true, component: 'Input', rules: [{ pattern: '^[A-Z]{2}-\\d{4}$', message: '格式：XX-0000' }] }" />
          </div>
          <div style="border: 1px solid #e8e8e8; border-radius: 8px; padding: 16px; margin-bottom: 12px; background: #fafafa">
            <div style="font-weight: 600; font-size: 14px; margin-bottom: 8px">项目描述</div>
            <FormField name="description" :field-props="{ label: '项目描述', component: 'Textarea' }" />
            <div style="color: #999; font-size: 12px; margin-top: 4px">不超过500字</div>
          </div>
          <!-- 内联装饰器包裹 -->
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px; padding: 8px 0; border-bottom: 1px dashed #e8e8e8">
            <span style="min-width: 80px; font-size: 13px; color: #555">联系人 <span style="color: #ff4d4f">*</span></span>
            <div style="flex: 1">
              <FormField name="contactName" :field-props="{ label: '联系人', required: true, component: 'Input' }" />
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px; padding: 8px 0; border-bottom: 1px dashed #e8e8e8">
            <span style="min-width: 80px; font-size: 13px; color: #555">电话</span>
            <div style="flex: 1">
              <FormField name="contactPhone" :field-props="{ label: '电话', component: 'Input', rules: [{ format: 'phone', message: '请输入有效手机号' }] }" />
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px; padding: 8px 0; border-bottom: 1px dashed #e8e8e8">
            <span style="min-width: 80px; font-size: 13px; color: #555">邮箱</span>
            <div style="flex: 1">
              <FormField name="contactEmail" :field-props="{ label: '邮箱', component: 'Input', rules: [{ format: 'email', message: '请输入有效邮箱' }] }" />
            </div>
          </div>
          <!-- 默认 FormItem 装饰器 -->
          <FormField name="budget" :field-props="{ label: '预算（万元）', component: 'InputNumber', componentProps: { min: 0 } }" />
          <FormField name="startDate" :field-props="{ label: '开始日期', component: 'DatePicker', componentProps: { style: 'width: 100%' } }" />
          <LayoutFormActions @reset="form.reset()" />
        </form>
      </FormProvider>
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
import type { FieldPattern } from '@moluoxixi/core'
import { LayoutFormActions, setupAntdVue, StatusTabs } from '@moluoxixi/ui-antd-vue'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/vue'
/**
 * 自定义装饰器 — Field 模式
 *
 * 使用 FormProvider + FormField，通过外层 div 模拟不同装饰器样式：
 * - 卡片装饰器（带背景和圆角的卡片包裹）
 * - 内联装饰器（左标签右内容的紧凑布局）
 * - 默认 FormItem 装饰器
 */
import { ref, watch } from 'vue'

setupAntdVue()
const st = ref<InstanceType<typeof StatusTabs>>()

const form = useCreateForm({
  initialValues: {
    projectName: '',
    projectCode: '',
    description: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    budget: 0,
    startDate: '',
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
