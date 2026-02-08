<template>
  <div>
    <h2>国际化（i18n）</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">多语言标签 / 验证消息国际化 — ConfigForm + Schema 实现</p>
    <StatusTabs ref="st" v-slot="{ mode, showResult }">
      <ConfigForm
        :key="locale"
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
import { setupElementPlus, StatusTabs } from '@moluoxixi/ui-element-plus'
import { ConfigForm } from '@moluoxixi/vue'
/**
 * 国际化 — Config 模式
 *
 * 使用 ConfigForm + Schema 实现国际化表单。
 * 切换语言时通过 computed schema 动态更新标签和验证消息。
 */
import { computed, ref } from 'vue'

setupElementPlus()

const st = ref<InstanceType<typeof StatusTabs>>()

/** 可用语言 */
type Locale = 'zh-CN' | 'en-US' | 'ja-JP'
const locale = ref<Locale>('zh-CN')

/** 翻译表 */
const I18N: Record<Locale, Record<string, string>> = {
  'zh-CN': { name: '姓名', email: '邮箱', phone: '手机号', bio: '简介', 'name.required': '姓名为必填项', 'email.invalid': '无效邮箱' },
  'en-US': { name: 'Name', email: 'Email', phone: 'Phone', bio: 'Bio', 'name.required': 'Name is required', 'email.invalid': 'Invalid email' },
  'ja-JP': { name: '名前', email: 'メール', phone: '電話', bio: '自己紹介', 'name.required': '名前は必須', 'email.invalid': '無効なメール' },
}

/** 翻译函数 */
function t(key: string): string {
  return I18N[locale.value]?.[key] ?? key
}

const initialValues = { name: '', email: '', phone: '', bio: '' }

const schema = computed<ISchema>(() => ({
  type: 'object',
  decoratorProps: { labelPosition: 'right', labelWidth: '100px', actions: { submit: '提交', reset: '重置' } },
  properties: {
    _locale: {
      type: 'void',
      component: 'LayoutCard',
      componentProps: { title: '语言切换' },
      properties: {},
    },
    name: { type: 'string', title: t('name'), required: true, rules: [{ required: true, message: t('name.required') }] },
    email: { type: 'string', title: t('email'), rules: [{ format: 'email', message: t('email.invalid') }] },
    phone: { type: 'string', title: t('phone') },
    bio: { type: 'string', title: t('bio'), component: 'Textarea', componentProps: { rows: 3 } },
  },
}))

/** 将 mode 注入 schema */
function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}
</script>
