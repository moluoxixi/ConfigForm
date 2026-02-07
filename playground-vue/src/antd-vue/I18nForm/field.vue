<template>
  <div>
    <h2>国际化（i18n）</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      多语言标签 / 验证消息国际化 / placeholder 国际化
    </p>
    <StatusTabs ref="st" v-slot="{ mode, showResult }">
      <FormProvider :form="form">
        <ASegmented v-model:value="locale" :options="[{ label: '🇨🇳 中文', value: 'zh-CN' }, { label: '🇺🇸 English', value: 'en-US' }, { label: '🇯🇵 日本語', value: 'ja-JP' }]" style="margin-bottom: 16px" />
        <FormField v-for="n in ['name', 'email', 'phone', 'bio']" :key="n" v-slot="{ field }" :name="n">
          <AFormItem :label="field.label" :required="field.required" :validate-status="field.errors.length > 0 ? 'error' : undefined" :help="field.errors[0]?.message">
            <template v-if="mode === 'readOnly'">
              <span v-if="n === 'bio'" style="white-space:pre-wrap">{{ (field.value as string) || '—' }}</span><span v-else>{{ (field.value as string) || '—' }}</span>
            </template>
            <ATextarea v-else-if="n === 'bio'" :value="(field.value as string) ?? ''" :disabled="mode === 'disabled'" :placeholder="t(`field.${n}.placeholder`)" :rows="3" @update:value="field.setValue($event)" @blur="field.blur(); field.validate('blur').catch(() => {})" />
            <AInput v-else :value="(field.value as string) ?? ''" :disabled="mode === 'disabled'" :placeholder="t(`field.${n}.placeholder`)" @update:value="field.setValue($event)" @blur="field.blur(); field.validate('blur').catch(() => {})" />
          </AFormItem>
        </FormField>
        <div v-if="mode === 'editable'" style="margin-top: 16px; display: flex; gap: 8px">
          <button type="button" style="padding: 4px 15px; background: #1677ff; color: #fff; border: none; border-radius: 6px; cursor: pointer" @click="handleSubmit(showResult)">
            提交
          </button>
          <button type="button" style="padding: 4px 15px; background: #fff; border: 1px solid #d9d9d9; border-radius: 6px; cursor: pointer" @click="form.reset()">
            重置
          </button>
        </div>
      </FormProvider>
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
import type { FieldPattern } from '@moluoxixi/shared'
import { setupAntdVue, StatusTabs } from '@moluoxixi/ui-antd-vue'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/vue'
import { FormItem as AFormItem, Input as AInput, Segmented as ASegmented, Textarea as ATextarea } from 'ant-design-vue'
import { onMounted, ref, watch } from 'vue'

setupAntdVue()

const st = ref<InstanceType<typeof StatusTabs>>()

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
</script>
