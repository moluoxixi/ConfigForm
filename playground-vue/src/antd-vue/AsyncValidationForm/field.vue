<template>
  <div>
    <h2>异步验证（Field 版）</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      用户名唯一性 / 邮箱可用性 / 邀请码 / 防抖 + AbortSignal - FormField + fieldProps 实现
    </p>
    <div style="padding: 8px 16px; margin-bottom: 16px; background: #e6f4ff; border: 1px solid #91caff; border-radius: 6px; font-size: 13px">已注册用户名: admin / test / root，有效邀请码: INVITE2024 / VIP888</div>
    <StatusTabs ref="st" v-slot="{ showResult }">
      <FormProvider :form="form">
          <FormField name="username" :field-props="{ label: '用户名', required: true, component: 'Input', componentProps: { placeholder: '试试 admin / test' }, rules: usernameRules }" />
          <FormField name="email" :field-props="{ label: '邮箱', required: true, component: 'Input', componentProps: { placeholder: '试试 admin@test.com' }, rules: emailRules }" />
          <FormField name="inviteCode" :field-props="{ label: '邀请码', required: true, component: 'Input', componentProps: { placeholder: 'INVITE2024 / VIP888' }, rules: inviteCodeRules }" />
          <FormField name="nickname" :field-props="{ label: '昵称', component: 'Input', componentProps: { placeholder: '无需异步验证' }, rules: [{ maxLength: 20, message: '不超过 20 字' }] }" />
          <LayoutFormActions @submit="showResult" @submit-failed="(e: any) => st?.showErrors(e)" />
      </FormProvider>
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
import type { FieldPattern } from '@moluoxixi/core'
import { LayoutFormActions, setupAntdVue, StatusTabs } from '@moluoxixi/ui-antd-vue'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/vue'
import { ref, watch } from 'vue'

setupAntdVue()

// ========== 模拟数据 ==========

/** 已注册用户名列表 */
const REGISTERED = ['admin', 'test', 'root', 'user']

/** 已注册邮箱列表 */
const REGISTERED_EMAILS = ['admin@test.com', 'test@test.com']

/** 有效邀请码列表 */
const VALID_CODES = ['INVITE2024', 'VIP888', 'NEWUSER']

/** 可取消的延迟函数 */
function delay(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms)
    signal.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(new Error('取消'))
    })
  })
}

// ========== 验证规则 ==========

/** 用户名验证规则：长度 + 异步唯一性检查 */
const usernameRules = [
  { minLength: 3, maxLength: 20, message: '3-20 字符' },
  {
    asyncValidator: async (v: unknown, _r: unknown, _c: unknown, signal: AbortSignal): Promise<string | undefined> => {
      await delay(800, signal)
      if (REGISTERED.includes(String(v).toLowerCase()))
        return `"${v}" 已被注册`
      return undefined
    },
    trigger: 'blur',
    debounce: 300,
  },
]

/** 邮箱验证规则：格式 + 异步可用性检查 */
const emailRules = [
  { format: 'email', message: '无效邮箱' },
  {
    asyncValidator: async (v: unknown, _r: unknown, _c: unknown, signal: AbortSignal): Promise<string | undefined> => {
      if (!v) return undefined
      await delay(800, signal)
      if (REGISTERED_EMAILS.includes(String(v).toLowerCase()))
        return '邮箱已注册'
      return undefined
    },
    trigger: 'blur',
    debounce: 500,
  },
]

/** 邀请码验证规则：长度 + 异步有效性检查 */
const inviteCodeRules = [
  { minLength: 3, message: '至少 3 字符' },
  {
    asyncValidator: async (v: unknown, _r: unknown, _c: unknown, signal: AbortSignal): Promise<string | undefined> => {
      if (!v) return undefined
      await delay(1000, signal)
      if (!VALID_CODES.includes(String(v).toUpperCase()))
        return '邀请码无效'
      return undefined
    },
    trigger: 'blur',
    debounce: 300,
  },
]

// ========== 表单 ==========

const st = ref<InstanceType<typeof StatusTabs>>()

const form = useCreateForm({
  initialValues: { username: '', email: '', inviteCode: '', nickname: '' },
})

/** 同步 StatusTabs 的 mode 到 form.pattern */
watch(() => st.value?.mode, (v) => {
  if (v)
    form.pattern = v as FieldPattern
}, { immediate: true })
</script>
