<template>
  <div>
    <h2>国际化（i18n）</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      多语言标签 / 验证消息国际化 / placeholder 国际化
    </p>
    <StatusTabs ref="st" v-slot="{ showResult }">
      <FormProvider :form="form">
          <!-- 语言切换器（附加内容） -->
          <div style="display: inline-flex; border: 1px solid #d9d9d9; border-radius: 6px; overflow: hidden; margin-bottom: 16px">
            <button v-for="opt in LOCALE_OPTIONS" :key="opt.value" :style="{ padding: '4px 12px', border: 'none', cursor: 'pointer', background: locale === opt.value ? '#1677ff' : '#fff', color: locale === opt.value ? '#fff' : 'inherit', fontSize: '14px' }" @click="locale = opt.value as Locale">
              {{ opt.label }}
            </button>
          </div>
          <FormField name="name" :field-props="{ label: t('field.name'), required: true, component: 'Input', rules: [{ required: true, message: t('field.name.required') }], componentProps: { placeholder: t('field.name.placeholder') } }" />
          <FormField name="email" :field-props="{ label: t('field.email'), component: 'Input', rules: [{ format: 'email', message: t('field.email.invalid') }], componentProps: { placeholder: t('field.email.placeholder') } }" />
          <FormField name="phone" :field-props="{ label: t('field.phone'), component: 'Input', componentProps: { placeholder: t('field.phone.placeholder') } }" />
          <FormField name="bio" :field-props="{ label: t('field.bio'), component: 'Textarea', componentProps: { placeholder: t('field.bio.placeholder'), rows: 3 } }" />
          <LayoutFormActions @submit="showResult" @submit-failed="(e: any) => st?.showErrors(e)" />
      </FormProvider>
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
import type { FieldPattern } from '@moluoxixi/shared'
import { LayoutFormActions, setupElementPlus, StatusTabs } from '@moluoxixi/ui-element-plus'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/vue'
/**
 * 国际化表单 — Field 模式
 *
 * 所有字段使用 FormField + fieldProps，标签/placeholder/验证消息通过 t() 翻译函数动态获取。
 * 切换语言时通过 watch 同步更新已创建字段的属性。
 */
import { ref, watch } from 'vue'

setupElementPlus()

const st = ref<InstanceType<typeof StatusTabs>>()

/** 可用语言类型 */
type Locale = 'zh-CN' | 'en-US' | 'ja-JP'

/** 语言切换选项 */
const LOCALE_OPTIONS = [
  { label: '🇨🇳 中文', value: 'zh-CN' },
  { label: '🇺🇸 English', value: 'en-US' },
  { label: '🇯🇵 日本語', value: 'ja-JP' },
]

/** 当前语言 */
const locale = ref<Locale>('zh-CN')

/** 多语言翻译表 */
const I18N: Record<Locale, Record<string, string>> = {
  'zh-CN': {
    'field.name': '姓名',
    'field.name.placeholder': '请输入姓名',
    'field.name.required': '姓名为必填项',
    'field.email': '邮箱',
    'field.email.placeholder': '请输入邮箱',
    'field.email.invalid': '无效邮箱',
    'field.phone': '手机号',
    'field.phone.placeholder': '请输入手机号',
    'field.bio': '简介',
    'field.bio.placeholder': '请输入简介',
    'btn.submit': '提交',
    'btn.reset': '重置',
  },
  'en-US': {
    'field.name': 'Name',
    'field.name.placeholder': 'Enter name',
    'field.name.required': 'Name is required',
    'field.email': 'Email',
    'field.email.placeholder': 'Enter email',
    'field.email.invalid': 'Invalid email',
    'field.phone': 'Phone',
    'field.phone.placeholder': 'Enter phone',
    'field.bio': 'Bio',
    'field.bio.placeholder': 'Tell us about yourself',
    'btn.submit': 'Submit',
    'btn.reset': 'Reset',
  },
  'ja-JP': {
    'field.name': '名前',
    'field.name.placeholder': '名前を入力',
    'field.name.required': '名前は必須',
    'field.email': 'メール',
    'field.email.placeholder': 'メールを入力',
    'field.email.invalid': '無効なメール',
    'field.phone': '電話',
    'field.phone.placeholder': '電話番号を入力',
    'field.bio': '自己紹介',
    'field.bio.placeholder': '自己紹介を入力',
    'btn.submit': '送信',
    'btn.reset': 'リセット',
  },
}

/** 翻译函数 */
function t(key: string): string {
  return I18N[locale.value]?.[key] ?? key
}

const form = useCreateForm({
  initialValues: { name: '', email: '', phone: '', bio: '' },
})

/** 同步 StatusTabs 的 mode 到 form.pattern */
watch(() => st.value?.mode, (v) => {
  if (v)
    form.pattern = v as FieldPattern
}, { immediate: true })

/**
 * 切换语言时同步更新已创建字段的属性
 *
 * fieldProps 在模板中通过 t() 动态计算，但已创建的字段实例属性需要手动更新。
 */
watch(locale, () => {
  const fieldKeys: Record<string, string> = {
    name: 'field.name',
    email: 'field.email',
    phone: 'field.phone',
    bio: 'field.bio',
  }
  Object.entries(fieldKeys).forEach(([name, key]) => {
    const f = form.getField(name)
    if (f) {
      f.label = t(key)
      f.setComponentProps({ placeholder: t(`${key}.placeholder`) })
    }
  })
  /* 更新验证规则的国际化消息 */
  const nameField = form.getField('name')
  if (nameField) {
    nameField.rules = [{ required: true, message: t('field.name.required') }]
  }
  const emailField = form.getField('email')
  if (emailField) {
    emailField.rules = [{ format: 'email', message: t('field.email.invalid') }]
  }
})

</script>
