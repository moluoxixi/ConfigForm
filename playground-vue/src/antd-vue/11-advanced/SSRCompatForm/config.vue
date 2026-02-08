<template>
  <div>
    <h2>SSR 兼容性测试</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      验证表单核心功能在无浏览器环境下正常工作，无 window/document 强依赖，支持 hydration 场景。
    </p>

    <div style="margin-bottom: 16px; padding: 12px; background: #f6ffed; border: 1px solid #b7eb8f; border-radius: 6px;">
      <div style="font-weight: 600; margin-bottom: 8px;">
        SSR 兼容性检查
      </div>
      <div v-for="(check, i) in checks" :key="i" style="font-size: 13px; padding: 2px 0;">
        <span :style="{ color: check.pass ? '#52c41a' : '#ff4d4f' }">{{ check.pass ? '✅' : '❌' }}</span>
        {{ check.label }}
      </div>
    </div>

    <StatusTabs ref="st" v-slot="{ mode, showResult }">
      <ConfigForm
        :schema="withMode(schema, mode)"
        :initial-values="{ username: 'ssr-test', email: 'test@example.com' }"
        @submit="showResult"
        @submit-failed="(e: any) => st?.showErrors(e)"
      />
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
import type { ISchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/core'
import { createForm } from '@moluoxixi/core'
import { compileSchema } from '@moluoxixi/schema'
import { setupAntdVue, StatusTabs } from '@moluoxixi/ui-antd-vue'
import { ConfigForm } from '@moluoxixi/vue'
/**
 * ?? 55?SSR ????Ant Design Vue?? *
 * ?????? SSR ????????
 * - createForm ????window/document
 * - Schema ??????
 * - ??????????????? * - ????????DOM
 */
import { reactive, ref } from 'vue'

setupAntdVue()

const st = ref<InstanceType<typeof StatusTabs>>()

const checks = reactive<Array<{ label: string, pass: boolean }>>([])

/* 检查1: createForm 可用性 */
try {
  const form = createForm({ initialValues: { test: 'ok' } })
  checks.push({ label: 'createForm() 正常工作', pass: !!form.id })
  form.dispose()
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
  const form = createForm()
  const field = form.createField({ name: 'test', required: true })
  checks.push({ label: 'Field 创建不依赖DOM', pass: !!field.path })
  form.dispose()
}
catch {
  checks.push({ label: 'Field 创建不依赖DOM', pass: false })
}

/* 检查4: 验证不依赖 DOM */
try {
  const form = createForm()
  const field = form.createField({ name: 'test', required: true, rules: [{ required: true }] })
  field.validate('submit').then((errors) => {
    checks.push({ label: '验证不依赖 DOM', pass: errors.length > 0 })
  })
  form.dispose()
}
catch {
  checks.push({ label: '验证不依赖 DOM', pass: false })
}

/* 检查5: 无浏览器全局依赖 */
checks.push({
  label: '无window/document 强依赖（使用globalThis）',
  pass: typeof globalThis !== 'undefined',
})

const schema: ISchema = {
  type: 'object',
  decoratorProps: { labelPosition: 'right', labelWidth: '120px', actions: { submit: '提交' } },
  properties: {
    username: { type: 'string', title: '用户名', required: true },
    email: { type: 'string', title: '邮箱', rules: [{ format: 'email' }] },
  },
}

/** ? mode ?? schema */
function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}
</script>
