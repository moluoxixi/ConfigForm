<template>
  <div>
    <h2>国际化（i18n）</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">
      多语言标签 / 验证消息国际化 / placeholder 国际化
    </p>
    <div style="display: flex; flex-direction: column; gap: 8px; width: 100%; margin-bottom: 16px">
      <div style="display: flex; gap: 8px">
        <button v-for="opt in MODE_OPTIONS" :key="opt.value" type="button" :style="{ padding: '4px 12px', borderRadius: '4px', border: '1px solid #dcdfe6', background: mode === opt.value ? '#409eff' : '#fff', color: mode === opt.value ? '#fff' : '#606266', cursor: 'pointer', fontSize: '12px' }" @click="mode = opt.value as FieldPattern">
          {{ opt.label }}
        </button>
      </div>
      <div style="display: flex; gap: 8px">
        <button v-for="l in LOCALE_OPTIONS" :key="l.value" type="button" :style="{ padding: '4px 12px', borderRadius: '4px', border: '1px solid #dcdfe6', background: locale === l.value ? '#409eff' : '#fff', color: locale === l.value ? '#fff' : '#606266', cursor: 'pointer', fontSize: '12px' }" @click="locale = l.value as Locale">
          {{ l.label }}
        </button>
      </div>
    </div>
    <FormProvider :form="form">
      <form novalidate @submit.prevent="handleSubmit">
        <FormField v-for="n in ['name', 'email', 'phone', 'bio']" :key="n" v-slot="{ field }" :name="n">
          <div style="margin-bottom: 18px">
            <label style="display: block; margin-bottom: 4px; font-size: 14px; color: #606266">
              <span v-if="field.required" style="color: #f56c6c; margin-right: 4px">*</span>{{ field.label }}
            </label>
            <textarea v-if="n === 'bio'" :value="(field.value as string) ?? ''" :disabled="mode === 'disabled'" :placeholder="t(`field.${n}.placeholder`)" rows="3" style="width: 100%; padding: 8px; border: 1px solid #dcdfe6; border-radius: 4px; font-size: 14px; resize: vertical; box-sizing: border-box" @input="field.setValue(($event.target as HTMLTextAreaElement).value)" @blur="field.blur(); field.validate('blur').catch(() => {})" />
            <input v-else :value="(field.value as string) ?? ''" :disabled="mode === 'disabled'" :placeholder="t(`field.${n}.placeholder`)" style="width: 100%; padding: 8px; border: 1px solid #dcdfe6; border-radius: 4px; font-size: 14px; box-sizing: border-box" @input="field.setValue(($event.target as HTMLInputElement).value)" @blur="field.blur(); field.validate('blur').catch(() => {})" />
            <div v-if="field.errors[0]?.message" style="color: #f56c6c; font-size: 12px; margin-top: 4px">
              {{ field.errors[0]?.message }}
            </div>
          </div>
        </FormField>
        <div style="display: flex; gap: 8px">
          <button type="submit" style="padding: 8px 16px; background: #409eff; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-size: 14px">
            {{ t('btn.submit') }}
          </button>
          <button type="reset" style="padding: 8px 16px; background: #fff; color: #606266; border: 1px solid #dcdfe6; border-radius: 4px; cursor: pointer; font-size: 14px">
            {{ t('btn.reset') }}
          </button>
        </div>
      </form>
    </FormProvider>
    <div v-if="result" :style="{ marginTop: '16px', padding: '12px 16px', borderRadius: '4px', background: result.startsWith('验证失败') ? '#fef0f0' : '#f0f9eb', color: result.startsWith('验证失败') ? '#f56c6c' : '#67c23a', border: result.startsWith('验证失败') ? '1px solid #fde2e2' : '1px solid #e1f3d8' }">
      <strong>提交结果</strong>
      <div style="margin-top: 4px; white-space: pre-wrap">{{ result }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FieldPattern } from '@moluoxixi/shared'
import { setupElementPlus } from '@moluoxixi/ui-element-plus'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/vue'
import { onMounted, ref, watch } from 'vue'

setupElementPlus()
const MODE_OPTIONS = [{ label: '编辑态', value: 'editable' }, { label: '阅读态', value: 'readOnly' }, { label: '禁用态', value: 'disabled' }]
const LOCALE_OPTIONS = [{ label: '🇨🇳 中文', value: 'zh-CN' }, { label: '🇺🇸 English', value: 'en-US' }, { label: '🇯🇵 日本語', value: 'ja-JP' }]
const mode = ref<FieldPattern>('editable')
const result = ref('')
type Locale = 'zh-CN' | 'en-US' | 'ja-JP'
const locale = ref<Locale>('zh-CN')
const I18N: Record<Locale, Record<string, string>> = {
  'zh-CN': { 'field.name': '姓名', 'field.name.placeholder': '请输入姓名', 'field.name.required': '姓名为必填项', 'field.email': '邮箱', 'field.email.placeholder': '请输入邮箱', 'field.email.invalid': '无效邮箱', 'field.phone': '手机号', 'field.phone.placeholder': '请输入手机号', 'field.bio': '简介', 'field.bio.placeholder': '请输入简介', 'btn.submit': '提交', 'btn.reset': '重置' },
  'en-US': { 'field.name': 'Name', 'field.name.placeholder': 'Enter name', 'field.name.required': 'Name is required', 'field.email': 'Email', 'field.email.placeholder': 'Enter email', 'field.email.invalid': 'Invalid email', 'field.phone': 'Phone', 'field.phone.placeholder': 'Enter phone', 'field.bio': 'Bio', 'field.bio.placeholder': 'Tell us about yourself', 'btn.submit': 'Submit', 'btn.reset': 'Reset' },
  'ja-JP': { 'field.name': '名前', 'field.name.placeholder': '名前を入力', 'field.name.required': '名前は必須', 'field.email': 'メール', 'field.email.placeholder': 'メールを入力', 'field.email.invalid': '無効なメール', 'field.phone': '電話', 'field.phone.placeholder': '電話番号を入力', 'field.bio': '自己紹介', 'field.bio.placeholder': '自己紹介を入力', 'btn.submit': '送信', 'btn.reset': 'リセット' },
}
function t(key: string): string {
  return I18N[locale.value]?.[key] ?? key
}
const form = useCreateForm({ initialValues: { name: '', email: '', phone: '', bio: '' } })
onMounted(() => {
  form.createField({ name: 'name', label: t('field.name'), required: true, rules: [{ required: true, message: t('field.name.required') }] })
  form.createField({ name: 'email', label: t('field.email'), rules: [{ format: 'email', message: t('field.email.invalid') }] })
  form.createField({ name: 'phone', label: t('field.phone') })
  form.createField({ name: 'bio', label: t('field.bio') })
})
watch(locale, () => {
  const map: Record<string, string> = { name: 'field.name', email: 'field.email', phone: 'field.phone', bio: 'field.bio' }
  Object.entries(map).forEach(([n, key]) => {
    const f = form.getField(n)
    if (f) {
      f.label = t(key)
      f.setComponentProps({ placeholder: t(`${key}.placeholder`) })
    }
  })
  const nf = form.getField('name')
  if (nf)
    nf.rules = [{ required: true, message: t('field.name.required') }]
  const ef = form.getField('email')
  if (ef)
    ef.rules = [{ format: 'email', message: t('field.email.invalid') }]
})
async function handleSubmit(): Promise<void> {
  const res = await form.submit()
  result.value = res.errors.length > 0 ? `验证失败: ${res.errors.map(e => e.message).join(', ')}` : JSON.stringify(res.values, null, 2)
}
</script>
