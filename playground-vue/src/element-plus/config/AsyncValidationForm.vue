<template>
  <div>
    <h2>异步验证</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">用户名唯一性 / 邮箱可用性 / 邀请码 / 防抖 + AbortSignal</p>
    <el-alert type="info" show-icon style="margin-bottom: 16px" title="提示" description="已注册用户名: admin / test / root，有效邀请码: INVITE2024 / VIP888" />
    <el-radio-group v-model="mode" size="small" style="margin-bottom: 16px">
      <el-radio-button v-for="opt in MODE_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</el-radio-button>
    </el-radio-group>
    <ConfigForm :key="mode" :schema="schema" :initial-values="savedValues" @values-change="(v: Record<string, unknown>) => savedValues = v" @submit="(v: Record<string, unknown>) => result = JSON.stringify(v, null, 2)" @submit-failed="(e: any[]) => result = '验证失败:\n' + e.map((x: any) => `[${x.path}] ${x.message}`).join('\n')">
      <template #default="{ form }"><el-space v-if="mode === 'editable'" style="margin-top: 16px"><el-button type="primary" native-type="submit">提交</el-button><el-button @click="form.reset()">重置</el-button></el-space></template>
    </ConfigForm>
    <el-alert v-if="result" :type="result.startsWith('验证失败') ? 'error' : 'success'" :title="result.startsWith('验证失败') ? '验证失败' : '提交成功'" :description="result" show-icon style="margin-top: 16px" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ConfigForm } from '@moluoxixi/vue'
import { setupElementPlus } from '@moluoxixi/ui-element-plus'
import type { FormSchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/shared'

setupElementPlus()
const MODE_OPTIONS = [{ label: '编辑态', value: 'editable' }, { label: '阅读态', value: 'readOnly' }, { label: '禁用态', value: 'disabled' }]
const mode = ref<FieldPattern>('editable')
const result = ref('')
const savedValues = ref<Record<string, unknown>>({ username: '', email: '', inviteCode: '', nickname: '' })

const REGISTERED = ['admin', 'test', 'root', 'user']
const REGISTERED_EMAILS = ['admin@test.com', 'test@test.com']
const VALID_CODES = ['INVITE2024', 'VIP888', 'NEWUSER']

function delay(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms)
    signal.addEventListener('abort', () => { clearTimeout(timer); reject(new Error('取消')) })
  })
}

const schema = computed<FormSchema>(() => ({
  form: { labelPosition: 'right', labelWidth: '140px', pattern: mode.value },
  fields: {
    username: { type: 'string', label: '用户名', required: true, component: 'Input', wrapper: 'FormItem', placeholder: '试试 admin / test', rules: [{ minLength: 3, maxLength: 20, message: '3-20 字符' }, { asyncValidator: async (v: unknown, _r: unknown, _c: unknown, signal: AbortSignal) => { await delay(800, signal); if (REGISTERED.includes(String(v).toLowerCase())) return `"${v}" 已被注册`; return undefined }, trigger: 'blur', debounce: 300 }] },
    email: { type: 'string', label: '邮箱', required: true, component: 'Input', wrapper: 'FormItem', placeholder: '试试 admin@test.com', rules: [{ format: 'email', message: '无效邮箱' }, { asyncValidator: async (v: unknown, _r: unknown, _c: unknown, signal: AbortSignal) => { if (!v) return undefined; await delay(800, signal); if (REGISTERED_EMAILS.includes(String(v).toLowerCase())) return '邮箱已注册'; return undefined }, trigger: 'blur', debounce: 500 }] },
    inviteCode: { type: 'string', label: '邀请码', required: true, component: 'Input', wrapper: 'FormItem', placeholder: 'INVITE2024 / VIP888', rules: [{ minLength: 3, message: '至少 3 字符' }, { asyncValidator: async (v: unknown, _r: unknown, _c: unknown, signal: AbortSignal) => { if (!v) return undefined; await delay(1000, signal); if (!VALID_CODES.includes(String(v).toUpperCase())) return '邀请码无效'; return undefined }, trigger: 'blur', debounce: 300 }] },
    nickname: { type: 'string', label: '昵称', component: 'Input', wrapper: 'FormItem', placeholder: '无需异步验证', rules: [{ maxLength: 20, message: '不超过 20 字' }] },
  },
}))
</script>
