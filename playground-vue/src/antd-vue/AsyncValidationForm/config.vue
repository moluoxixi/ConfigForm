<template>
  <div>
    <h2>异步验证</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      用户名唯一性 / 邮箱可用性 / 邀请码 / 防抖 + AbortSignal
    </p>
    <div style="padding: 8px 12px; background: #e6f7ff; border: 1px solid #91caff; border-radius: 6px; color: rgba(0,0,0,0.88); font-size: 14px; margin-bottom: 16px; display: flex; align-items: center; gap: 8px">
      <span style="color: #1677ff">ℹ</span>
      <span>已注册用户名: admin / test / root，有效邀请码: INVITE2024 / VIP888</span>
    </div>
    <StatusTabs ref="st" v-slot="{ mode, showResult }">
      <ConfigForm
        :schema="withMode(schema, mode)"
        :initial-values="initialValues"
        @submit="showResult"
        @submit-failed="(e: any) => st?.showErrors(e)"
      />
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
import type { ISchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/core'
import { setupAntdVue, StatusTabs } from '@moluoxixi/ui-antd-vue'
import { ConfigForm } from '@moluoxixi/vue'
import { ref } from 'vue'

setupAntdVue()

const st = ref<InstanceType<typeof StatusTabs>>()

/** 工具：将 mode 注入 schema */
function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}

const initialValues = { username: '', email: '', inviteCode: '', nickname: '' }

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

const schema: ISchema = {
  type: 'object',
  decoratorProps: { actions: { submit: true, reset: true }, labelPosition: 'right', labelWidth: '140px' },
  properties: {
    username: { type: 'string', title: '用户名', required: true, placeholder: '试试 admin / test', rules: [{ minLength: 3, maxLength: 20, message: '3-20 字符' }, { asyncValidator: async (v: unknown, _r: unknown, _c: unknown, signal: AbortSignal) => {
      await delay(800, signal)
      if (REGISTERED.includes(String(v).toLowerCase()))
        return `"${v}" 已被注册`
      return undefined
    }, trigger: 'blur', debounce: 300 }] },
    email: { type: 'string', title: '邮箱', required: true, placeholder: '试试 admin@test.com', rules: [{ format: 'email', message: '无效邮箱' }, { asyncValidator: async (v: unknown, _r: unknown, _c: unknown, signal: AbortSignal) => {
      if (!v)
        return undefined
      await delay(800, signal)
      if (REGISTERED_EMAILS.includes(String(v).toLowerCase()))
        return '邮箱已注册'
      return undefined
    }, trigger: 'blur', debounce: 500 }] },
    inviteCode: { type: 'string', title: '邀请码', required: true, placeholder: 'INVITE2024 / VIP888', rules: [{ minLength: 3, message: '至少 3 字符' }, { asyncValidator: async (v: unknown, _r: unknown, _c: unknown, signal: AbortSignal) => {
      if (!v)
        return undefined
      await delay(1000, signal)
      if (!VALID_CODES.includes(String(v).toUpperCase()))
        return '邀请码无效'
      return undefined
    }, trigger: 'blur', debounce: 300 }] },
    nickname: { type: 'string', title: '昵称', placeholder: '无需异步验证', rules: [{ maxLength: 20, message: '不超过 20 字' }] },
  },
}
</script>
