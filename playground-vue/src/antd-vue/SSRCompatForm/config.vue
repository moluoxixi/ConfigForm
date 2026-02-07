<template>
  <div>
    <h2>SSR ????/h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      ??????????????????????window/document ???hydration ????    </p>

    <div style="margin-bottom: 16px; padding: 12px; background: #f6ffed; border: 1px solid #b7eb8f; border-radius: 6px;">
      <div style="font-weight: 600; margin-bottom: 8px;">SSR ????????/div>
      <div v-for="(check, i) in checks" :key="i" style="font-size: 13px; padding: 2px 0;">
        <span :style="{ color: check.pass ? '#52c41a' : '#ff4d4f' }">{{ check.pass ? '?? : '?? }}</span>
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
/**
 * ?? 55?SSR ????Ant Design Vue?? *
 * ?????? SSR ????????
 * - createForm ????window/document
 * - Schema ??????
 * - ??????????????? * - ????????DOM
 */
import { reactive, ref } from 'vue'
import { createForm } from '@moluoxixi/core'
import { compileSchema } from '@moluoxixi/schema'
import { setupAntdVue, StatusTabs } from '@moluoxixi/ui-antd-vue'
import { ConfigForm } from '@moluoxixi/vue'
import type { ISchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/shared'

setupAntdVue()

const st = ref<InstanceType<typeof StatusTabs>>()

const checks = reactive<Array<{ label: string; pass: boolean }>>([])

/* ???1: createForm ???? */
try {
  const form = createForm({ initialValues: { test: 'ok' } })
  checks.push({ label: 'createForm() ????', pass: !!form.id })
  form.dispose()
}
catch {
  checks.push({ label: 'createForm() ????', pass: false })
}

/* ???2: compileSchema ????*/
try {
  const compiled = compileSchema({
    type: 'object',
    properties: { name: { type: 'string', title: '??' } },
  })
  checks.push({ label: 'compileSchema() ??????, pass: compiled.fields.size > 0 })
}
catch {
  checks.push({ label: 'compileSchema() ??????, pass: false })
}

/* ???3: Field ???????? DOM */
try {
  const form = createForm()
  const field = form.createField({ name: 'test', required: true })
  checks.push({ label: 'Field ??????DOM', pass: !!field.path })
  form.dispose()
}
catch {
  checks.push({ label: 'Field ??????DOM', pass: false })
}

/* ???4: ?????? DOM */
try {
  const form = createForm()
  const field = form.createField({ name: 'test', required: true, rules: [{ required: true }] })
  field.validate('submit').then((errors) => {
    checks.push({ label: '?????? DOM', pass: errors.length > 0 })
  })
  form.dispose()
}
catch {
  checks.push({ label: '?????? DOM', pass: false })
}

/* ???5: ???????*/
checks.push({
  label: '??window/document ??????????,
  pass: typeof globalThis !== 'undefined',
})

const schema: ISchema = {
  type: 'object',
  decoratorProps: { labelPosition: 'right', labelWidth: '120px', actions: { submit: '??' } },
  properties: {
    username: { type: 'string', title: '????, required: true },
    email: { type: 'string', title: '??', rules: [{ format: 'email' }] },
  },
}

/** ? mode ?? schema */
function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}
</script>
