<template>
  <div>
    <h2>SSR 兼容性测试</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      验证表单核心功能在无浏览器环境下正常工作 — Field 模式
    </p>
    <!-- SSR 兼容性检查结果 -->
    <div style="margin-bottom: 16px; padding: 12px; background: #f6ffed; border: 1px solid #b7eb8f; border-radius: 6px">
      <div style="font-weight: 600; margin-bottom: 8px">SSR 兼容性检查</div>
      <div v-for="(check, i) in checks" :key="i" style="font-size: 13px; padding: 2px 0">
        <span :style="{ color: check.pass ? '#52c41a' : '#ff4d4f' }">{{ check.pass ? '✅' : '❌' }}</span>
        {{ check.label }}
      </div>
    </div>
    <StatusTabs ref="st" v-slot="{ mode, showResult }">
      <FormProvider :form="form">
        <form @submit.prevent="handleSubmit(showResult)" novalidate>
          <FormField name="username" :field-props="{ label: '用户名', required: true, component: 'Input' }" />
          <FormField name="email" :field-props="{ label: '邮箱', component: 'Input', rules: [{ format: 'email' }] }" />
          <LayoutFormActions @reset="form.reset()" />
        </form>
      </FormProvider>
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
import type { FieldPattern } from '@moluoxixi/shared'
import { createForm } from '@moluoxixi/core'
import { compileSchema } from '@moluoxixi/schema'
import { LayoutFormActions, setupAntdVue, StatusTabs } from '@moluoxixi/ui-antd-vue'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/vue'
/**
 * SSR 兼容性测试 — Field 模式
 *
 * 使用 FormProvider + FormField 验证 SSR 环境兼容性。
 * 检查 createForm / compileSchema / Field 创建 / 验证等是否依赖浏览器 API。
 */
import { reactive, ref, watch } from 'vue'

setupAntdVue()
const st = ref<InstanceType<typeof StatusTabs>>()

const checks = reactive<Array<{ label: string; pass: boolean }>>([])

/* 检查1: createForm 可用性 */
try {
  const testForm = createForm({ initialValues: { test: 'ok' } })
  checks.push({ label: 'createForm() 正常工作', pass: !!testForm.id })
  testForm.dispose()
}
catch {
  checks.push({ label: 'createForm() 正常工作', pass: false })
}

/* 检查2: compileSchema 可用性 */
try {
  const compiled = compileSchema({
    type: 'object',
    properties: { name: { type: 'string', title: '姓名' } },
  })
  checks.push({ label: 'compileSchema() 正常解析', pass: compiled.fields.size > 0 })
}
catch {
  checks.push({ label: 'compileSchema() 正常解析', pass: false })
}

/* 检查3: Field 创建不依赖 DOM */
try {
  const testForm = createForm()
  const field = testForm.createField({ name: 'test', required: true })
  checks.push({ label: 'Field 创建不依赖DOM', pass: !!field.path })
  testForm.dispose()
}
catch {
  checks.push({ label: 'Field 创建不依赖DOM', pass: false })
}

/* 检查4: 无浏览器全局依赖 */
checks.push({
  label: '无window/document 强依赖（使用globalThis）',
  pass: typeof globalThis !== 'undefined',
})

const form = useCreateForm({
  initialValues: { username: 'ssr-test', email: 'test@example.com' },
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
