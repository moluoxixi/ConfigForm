<template>
  <div>
    <h2>分步表单</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      Steps 导航 / 步骤验证 / 逐步填写 — FormField + Steps 实现
    </p>
    <StatusTabs ref="st" v-slot="{ showResult }">
      <FormProvider :form="form">
          <!-- 步骤导航 -->
          <div style="display: flex; margin-bottom: 24px">
            <div v-for="(title, idx) in STEP_TITLES" :key="idx" style="flex: 1; text-align: center; position: relative">
              <div :style="{ width: '24px', height: '24px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '600', color: '#fff', background: idx < currentStep ? '#52c41a' : idx === currentStep ? '#1677ff' : '#d9d9d9' }">
                {{ idx < currentStep ? '✓' : idx + 1 }}
              </div>
              <div :style="{ fontSize: '14px', marginTop: '4px', color: idx === currentStep ? '#1677ff' : 'rgba(0,0,0,0.45)' }">{{ title }}</div>
            </div>
          </div>
          <!-- 步骤 1：基本信息 -->
          <div v-show="currentStep === 0" style="border: 1px solid #d9d9d9; border-radius: 8px; padding: 16px; margin-bottom: 16px">
            <div style="font-weight: 600; margin-bottom: 12px; font-size: 14px">第 1 步：基本信息</div>
            <FormField name="name" :field-props="{ label: '姓名', required: true, component: 'Input', rules: [{ minLength: 2, message: '至少 2 字' }] }" />
            <FormField name="phone" :field-props="{ label: '手机号', required: true, component: 'Input', rules: [{ format: 'phone', message: '无效手机号' }] }" />
            <FormField name="email" :field-props="{ label: '邮箱', required: true, component: 'Input', rules: [{ format: 'email', message: '无效邮箱' }] }" />
          </div>
          <!-- 步骤 2：工作信息 -->
          <div v-show="currentStep === 1" style="border: 1px solid #d9d9d9; border-radius: 8px; padding: 16px; margin-bottom: 16px">
            <div style="font-weight: 600; margin-bottom: 12px; font-size: 14px">第 2 步：工作信息</div>
            <FormField name="company" :field-props="{ label: '公司', required: true, component: 'Input' }" />
            <FormField name="position" :field-props="{ label: '职位', required: true, component: 'Input' }" />
          </div>
          <!-- 步骤 3：确认 -->
          <div v-show="currentStep === 2" style="border: 1px solid #d9d9d9; border-radius: 8px; padding: 16px; margin-bottom: 16px">
            <div style="font-weight: 600; margin-bottom: 12px; font-size: 14px">第 3 步：确认提交</div>
            <p>姓名：{{ form.getFieldValue('name') || '—' }}</p>
            <p>手机：{{ form.getFieldValue('phone') || '—' }}</p>
            <p>邮箱：{{ form.getFieldValue('email') || '—' }}</p>
            <p>公司：{{ form.getFieldValue('company') || '—' }}</p>
            <p>职位：{{ form.getFieldValue('position') || '—' }}</p>
          </div>
          <div style="margin-top: 16px; display: flex; gap: 8px">
            <button v-if="currentStep > 0" type="button" style="padding: 4px 15px; border: 1px solid #d9d9d9; border-radius: 6px; background: #fff; cursor: pointer; font-size: 14px" @click="currentStep--">上一步</button>
            <button v-if="currentStep < 2" type="button" style="padding: 4px 15px; border: none; border-radius: 6px; background: #1677ff; color: #fff; cursor: pointer; font-size: 14px" @click="nextStep">下一步</button>
            <LayoutFormActions @submit="showResult" @submit-failed="(e: any) => st?.showErrors(e)" @reset="form.reset(); currentStep = 0" />
          </div>
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
import { ref, watch } from 'vue'

setupAntdVue()
const st = ref<InstanceType<typeof StatusTabs>>()

/** 步骤标题 */
const STEP_TITLES = ['基本信息', '工作信息', '确认提交']

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

</script>
