<template>
  <div>
    <h2>异步验证（Field 版）</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">
      用户名唯一性 / 邮箱可用性 / 邀请码 / 防抖 + AbortSignal — FormField 实现
    </p>
    <StatusTabs ref="st" v-slot="{ showResult }">
      <FormProvider :form="form">
        <form novalidate @submit.prevent="handleSubmit(showResult)">
          <FormField name="username" :field-props="{
            label: '用户名',
            required: true,
            component: 'Input',
            componentProps: { placeholder: '试试 admin / test' },
            rules: [
              { minLength: 3, maxLength: 20, message: '3-20 字符' },
              { asyncValidator: asyncCheckUsername, trigger: 'blur', debounce: 300 },
            ],
          }" />
          <FormField name="email" :field-props="{
            label: '邮箱',
            required: true,
            component: 'Input',
            componentProps: { placeholder: '试试 admin@test.com' },
            rules: [
              { format: 'email', message: '无效邮箱' },
              { asyncValidator: asyncCheckEmail, trigger: 'blur', debounce: 500 },
            ],
          }" />
          <FormField name="inviteCode" :field-props="{
            label: '邀请码',
            required: true,
            component: 'Input',
            componentProps: { placeholder: 'INVITE2024 / VIP888' },
            rules: [
              { minLength: 3, message: '至少 3 字符' },
              { asyncValidator: asyncCheckInviteCode, trigger: 'blur', debounce: 300 },
            ],
          }" />
          <FormField name="nickname" :field-props="{
            label: '昵称',
            component: 'Input',
            componentProps: { placeholder: '无需异步验证' },
            rules: [{ maxLength: 20, message: '不超过 20 字' }],
          }" />
          <LayoutFormActions @reset="form.reset()" />
        </form>
      </FormProvider>
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
/**
 * 异步验证 — Field 模式（Element Plus）
 *
 * 使用 FormProvider + FormField 实现异步验证。
 * 已注册用户名: admin / test / root，有效邀请码: INVITE2024 / VIP888
 */
import type { FieldPattern } from '@moluoxixi/shared'
import { LayoutFormActions, setupElementPlus, StatusTabs } from '@moluoxixi/ui-element-plus'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/vue'
import { ref, watch } from 'vue'

setupElementPlus()

const st = ref<InstanceType<typeof StatusTabs>>()

const REGISTERED = ['admin', 'test', 'root', 'user']
const REGISTERED_EMAILS = ['admin@test.com', 'test@test.com']
const VALID_CODES = ['INVITE2024', 'VIP888', 'NEWUSER']

function delay(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms)
    signal.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(new Error('取消'))
    })
  })
}

async function asyncCheckUsername(v: unknown, _r: unknown, _c: unknown, signal: AbortSignal): Promise<string | undefined> {
  await delay(800, signal)
  if (REGISTERED.includes(String(v).toLowerCase()))
    return `"${v}" 已被注册`
  return undefined
}

async function asyncCheckEmail(v: unknown, _r: unknown, _c: unknown, signal: AbortSignal): Promise<string | undefined> {
  if (!v) return undefined
  await delay(800, signal)
  if (REGISTERED_EMAILS.includes(String(v).toLowerCase()))
    return '邮箱已注册'
  return undefined
}

async function asyncCheckInviteCode(v: unknown, _r: unknown, _c: unknown, signal: AbortSignal): Promise<string | undefined> {
  if (!v) return undefined
  await delay(1000, signal)
  if (!VALID_CODES.includes(String(v).toUpperCase()))
    return '邀请码无效'
  return undefined
}

const form = useCreateForm({
  initialValues: { username: '', email: '', inviteCode: '', nickname: '' },
})

watch(() => st.value?.mode, (v) => {
  if (v) form.pattern = v as FieldPattern
}, { immediate: true })

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
