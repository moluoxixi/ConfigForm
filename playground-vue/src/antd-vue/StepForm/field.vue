<template>
  <div>
    <h2>分步表单</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      Steps 导航 / 步骤验证 / 逐步填写 — FormField + Steps 实现
    </p>
    <StatusTabs ref="st" v-slot="{ mode, showResult }">
      <FormProvider :form="form">
        <form @submit.prevent="handleSubmit(showResult)" novalidate>
          <!-- 步骤导航 -->
          <ASteps :current="currentStep" size="small" style="margin-bottom: 24px">
            <AStep title="基本信息" />
            <AStep title="工作信息" />
            <AStep title="确认提交" />
          </ASteps>
          <!-- 步骤 1：基本信息 -->
          <ACard v-show="currentStep === 0" size="small" title="第 1 步：基本信息">
            <FormField name="name" :field-props="{ label: '姓名', required: true, component: 'Input', rules: [{ minLength: 2, message: '至少 2 字' }] }" />
            <FormField name="phone" :field-props="{ label: '手机号', required: true, component: 'Input', rules: [{ format: 'phone', message: '无效手机号' }] }" />
            <FormField name="email" :field-props="{ label: '邮箱', required: true, component: 'Input', rules: [{ format: 'email', message: '无效邮箱' }] }" />
          </ACard>
          <!-- 步骤 2：工作信息 -->
          <ACard v-show="currentStep === 1" size="small" title="第 2 步：工作信息">
            <FormField name="company" :field-props="{ label: '公司', required: true, component: 'Input' }" />
            <FormField name="position" :field-props="{ label: '职位', required: true, component: 'Input' }" />
          </ACard>
          <!-- 步骤 3：确认 -->
          <ACard v-show="currentStep === 2" size="small" title="第 3 步：确认提交">
            <p>姓名：{{ form.getFieldValue('name') || '—' }}</p>
            <p>手机：{{ form.getFieldValue('phone') || '—' }}</p>
            <p>邮箱：{{ form.getFieldValue('email') || '—' }}</p>
            <p>公司：{{ form.getFieldValue('company') || '—' }}</p>
            <p>职位：{{ form.getFieldValue('position') || '—' }}</p>
          </ACard>
          <div v-if="mode === 'editable'" style="margin-top: 16px; display: flex; gap: 8px">
            <AButton v-if="currentStep > 0" @click="currentStep--">上一步</AButton>
            <AButton v-if="currentStep < 2" type="primary" @click="nextStep">下一步</AButton>
            <LayoutFormActions @reset="form.reset(); currentStep = 0" />
          </div>
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
 * 分步表单 — Field 模式
 *
 * 使用 FormProvider + FormField + ASteps 实现分步填写。
 * 通过 currentStep 控制可见步骤，下一步前校验当前步骤字段。
 */
import { Button as AButton, Card as ACard, Step as AStep, Steps as ASteps } from 'ant-design-vue'
import { ref, watch } from 'vue'

setupAntdVue()
const st = ref<InstanceType<typeof StatusTabs>>()

/** 当前步骤索引 */
const currentStep = ref(0)

/** 步骤对应的字段名 */
const STEP_FIELDS: string[][] = [
  ['name', 'phone', 'email'],
  ['company', 'position'],
]

const form = useCreateForm({
  initialValues: { name: '', phone: '', email: '', company: '', position: '' },
})

/** 下一步：校验当前步骤字段 */
async function nextStep(): Promise<void> {
  const fields = STEP_FIELDS[currentStep.value]
  if (!fields) {
    currentStep.value++
    return
  }
  const res = await form.submit()
  /* 仅检查当前步骤字段的错误 */
  const stepErrors = res.errors.filter((e: { path?: string }) => fields.some(f => e.path?.startsWith(f)))
  if (stepErrors.length > 0) {
    st.value?.showErrors(stepErrors)
  }
  else {
    currentStep.value++
  }
}

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
