<template>
  <div>
    <h2>国际化（i18n）</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">多语言标签 / 验证消息国际化 / placeholder 国际化</p>
    <ASpace direction="vertical" :style="{ width: '100%', marginBottom: '16px' }"><ASegmented v-model:value="mode" :options="MODE_OPTIONS" /><ASegmented v-model:value="locale" :options="[{label:'🇨🇳 中文',value:'zh-CN'},{label:'🇺🇸 English',value:'en-US'},{label:'🇯🇵 日本語',value:'ja-JP'}]" /></ASpace>
    <FormProvider :form="form"><form @submit.prevent="handleSubmit" novalidate>
      <FormField v-for="n in ['name','email','phone','bio']" :key="n" v-slot="{ field }" :name="n"><AFormItem :label="field.label" :required="field.required" :validate-status="field.errors.length > 0 ? 'error' : undefined" :help="field.errors[0]?.message">
        <template v-if="mode === 'readOnly'"><span v-if="n === 'bio'" style="white-space:pre-wrap">{{ (field.value as string) || '—' }}</span><span v-else>{{ (field.value as string) || '—' }}</span></template>
        <ATextarea v-else-if="n === 'bio'" :value="(field.value as string) ?? ''" @update:value="field.setValue($event)" @blur="field.blur(); field.validate('blur').catch(() => {})" :disabled="mode === 'disabled'" :placeholder="t(`field.${n}.placeholder`)" :rows="3" />
        <AInput v-else :value="(field.value as string) ?? ''" @update:value="field.setValue($event)" @blur="field.blur(); field.validate('blur').catch(() => {})" :disabled="mode === 'disabled'" :placeholder="t(`field.${n}.placeholder`)" />
      </AFormItem></FormField>
      <ASpace v-if="mode === 'editable'"><AButton type="primary" html-type="submit">{{ t('btn.submit') }}</AButton><AButton html-type="reset">{{ t('btn.reset') }}</AButton></ASpace>
    </form></FormProvider>
    <AAlert v-if="result" :type="result.startsWith('验证失败') ? 'error' : 'success'" message="提交结果" style="margin-top: 16px"><template #description><pre style="margin: 0; white-space: pre-wrap">{{ result }}</pre></template></AAlert>
  </div>
</template>
<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { FormProvider, FormField, useCreateForm } from '@moluoxixi/vue'
import { setupAntdVue } from '@moluoxixi/ui-antd-vue'
import { Button as AButton, Space as ASpace, Alert as AAlert, Segmented as ASegmented, Input as AInput, FormItem as AFormItem, Textarea as ATextarea } from 'ant-design-vue'
import type { FieldPattern } from '@moluoxixi/shared'
setupAntdVue()
const MODE_OPTIONS = [{ label: '编辑态', value: 'editable' }, { label: '阅读态', value: 'readOnly' }, { label: '禁用态', value: 'disabled' }]
const mode = ref<FieldPattern>('editable')
const result = ref('')
type Locale = 'zh-CN' | 'en-US' | 'ja-JP'
const locale = ref<Locale>('zh-CN')
const I18N: Record<Locale, Record<string, string>> = {
  'zh-CN': { 'field.name': '姓名', 'field.name.placeholder': '请输入姓名', 'field.name.required': '姓名为必填项', 'field.email': '邮箱', 'field.email.placeholder': '请输入邮箱', 'field.email.invalid': '无效邮箱', 'field.phone': '手机号', 'field.phone.placeholder': '请输入手机号', 'field.bio': '简介', 'field.bio.placeholder': '请输入简介', 'btn.submit': '提交', 'btn.reset': '重置' },
  'en-US': { 'field.name': 'Name', 'field.name.placeholder': 'Enter name', 'field.name.required': 'Name is required', 'field.email': 'Email', 'field.email.placeholder': 'Enter email', 'field.email.invalid': 'Invalid email', 'field.phone': 'Phone', 'field.phone.placeholder': 'Enter phone', 'field.bio': 'Bio', 'field.bio.placeholder': 'Tell us about yourself', 'btn.submit': 'Submit', 'btn.reset': 'Reset' },
  'ja-JP': { 'field.name': '名前', 'field.name.placeholder': '名前を入力', 'field.name.required': '名前は必須', 'field.email': 'メール', 'field.email.placeholder': 'メールを入力', 'field.email.invalid': '無効なメール', 'field.phone': '電話', 'field.phone.placeholder': '電話番号を入力', 'field.bio': '自己紹介', 'field.bio.placeholder': '自己紹介を入力', 'btn.submit': '送信', 'btn.reset': 'リセット' },
}
function t(key: string): string { return I18N[locale.value]?.[key] ?? key }
const form = useCreateForm({ initialValues: { name: '', email: '', phone: '', bio: '' } })
onMounted(() => { form.createField({ name: 'name', label: t('field.name'), required: true, rules: [{ required: true, message: t('field.name.required') }] }); form.createField({ name: 'email', label: t('field.email'), rules: [{ format: 'email', message: t('field.email.invalid') }] }); form.createField({ name: 'phone', label: t('field.phone') }); form.createField({ name: 'bio', label: t('field.bio') }) })
watch(locale, () => { const map: Record<string, string> = { name: 'field.name', email: 'field.email', phone: 'field.phone', bio: 'field.bio' }; Object.entries(map).forEach(([n, key]) => { const f = form.getField(n); if (f) { f.label = t(key); f.setComponentProps({ placeholder: t(`${key}.placeholder`) }) } }); const nf = form.getField('name'); if (nf) nf.rules = [{ required: true, message: t('field.name.required') }]; const ef = form.getField('email'); if (ef) ef.rules = [{ format: 'email', message: t('field.email.invalid') }] })
async function handleSubmit(): Promise<void> { const res = await form.submit(); result.value = res.errors.length > 0 ? '验证失败: ' + res.errors.map(e => e.message).join(', ') : JSON.stringify(res.values, null, 2) }
</script>
