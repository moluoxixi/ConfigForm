<template>
  <div>
    <h2>分步表单（Field 版）</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">
      Steps 导航 / 步骤验证 / 逐步填写 — FormField + Steps 实现
    </p>
    <StatusTabs ref="st" v-slot="{ mode, showResult }">
      <FormProvider :form="form">
        <form novalidate @submit.prevent="handleSubmit(showResult)">
          <!-- 步骤导航 -->
          <el-steps :active="currentStep" simple style="margin-bottom: 24px">
            <el-step title="基本信息" />
            <el-step title="工作信息" />
            <el-step title="确认提交" />
          </el-steps>
          <!-- 步骤 1：基本信息 -->
          <el-card v-show="currentStep === 0" shadow="never" header="第 1 步：基本信息">
            <FormField name="name" :field-props="{ label: '姓名', required: true, component: 'Input', rules: [{ minLength: 2, message: '至少 2 字' }] }" />
            <FormField name="phone" :field-props="{ label: '手机号', required: true, component: 'Input', rules: [{ format: 'phone', message: '无效手机号' }] }" />
            <FormField name="email" :field-props="{ label: '邮箱', required: true, component: 'Input', rules: [{ format: 'email', message: '无效邮箱' }] }" />
          </el-card>
          <!-- 步骤 2：工作信息 -->
          <el-card v-show="currentStep === 1" shadow="never" header="第 2 步：工作信息">
            <FormField name="company" :field-props="{ label: '公司', required: true, component: 'Input' }" />
            <FormField name="position" :field-props="{ label: '职位', required: true, component: 'Input' }" />
          </el-card>
          <!-- 步骤 3：确认 -->
          <el-card v-show="currentStep === 2" shadow="never" header="第 3 步：确认提交">
            <p>姓名：{{ form.getFieldValue('name') || '—' }}</p>
            <p>手机：{{ form.getFieldValue('phone') || '—' }}</p>
            <p>邮箱：{{ form.getFieldValue('email') || '—' }}</p>
            <p>公司：{{ form.getFieldValue('company') || '—' }}</p>
            <p>职位：{{ form.getFieldValue('position') || '—' }}</p>
          </el-card>
          <div style="margin-top: 16px; display: flex; gap: 8px">
            <el-button v-if="currentStep > 0" @click="currentStep--">
              上一步
            </el-button>
            <el-button v-if="currentStep < 2" type="primary" @click="nextStep">
              下一步
            </el-button>
            <LayoutFormActions @reset="form.reset(); currentStep = 0" />
          </div>
        </form>
      </FormProvider>
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
/**
 * 分步表单 — Field 模式（Element Plus）
 *
 * 使用 FormProvider + FormField + ElSteps 实现分步填写。
 * 通过 currentStep 控制可见步骤，下一步前校验当前步骤字段。
 */
import type { FieldPattern } from '@moluoxixi/shared'
import { LayoutFormActions, setupElementPlus, StatusTabs } from '@moluoxixi/ui-element-plus'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/vue'
import { ref, watch } from 'vue'

setupElementPlus()
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
