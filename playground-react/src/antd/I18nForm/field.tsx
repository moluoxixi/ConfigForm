import { FormField, FormProvider, useCreateForm } from '@moluoxixi/react'
import { LayoutFormActions, StatusTabs, setupAntd } from '@moluoxixi/ui-antd'
import { observer } from 'mobx-react-lite'
/**
 * 场景 46：国际化
 *
 * 覆盖：
 * - 多语言标签切换
 * - 验证消息国际化
 * - placeholder 国际化
 * - 三种模式切换
 *
 * 所有字段使用 FormField + fieldProps，标签/placeholder/验证消息通过 t() 翻译函数获取。
 * 切换语言时通过 useEffect 同步更新已创建字段的属性。
 */
import React, { useEffect, useState } from 'react'

setupAntd()

/** 可用语言类型 */
type Locale = 'zh-CN' | 'en-US' | 'ja-JP'

/** 语言切换选项 */
const LOCALE_OPTIONS = [
  { label: '🇨🇳 中文', value: 'zh-CN' },
  { label: '🇺🇸 English', value: 'en-US' },
  { label: '🇯🇵 日本語', value: 'ja-JP' },
]

/** 多语言翻译表 */
const I18N: Record<Locale, Record<string, string>> = {
  'zh-CN': {
    'field.name': '姓名',
    'field.name.placeholder': '请输入姓名',
    'field.name.required': '姓名为必填项',
    'field.email': '邮箱',
    'field.email.placeholder': '请输入邮箱',
    'field.email.invalid': '请输入有效邮箱',
    'field.phone': '手机号',
    'field.phone.placeholder': '请输入手机号',
    'field.bio': '个人简介',
    'field.bio.placeholder': '请输入简介',
  },
  'en-US': {
    'field.name': 'Name',
    'field.name.placeholder': 'Enter your name',
    'field.name.required': 'Name is required',
    'field.email': 'Email',
    'field.email.placeholder': 'Enter your email',
    'field.email.invalid': 'Please enter a valid email',
    'field.phone': 'Phone',
    'field.phone.placeholder': 'Enter phone number',
    'field.bio': 'Bio',
    'field.bio.placeholder': 'Tell us about yourself',
  },
  'ja-JP': {
    'field.name': '名前',
    'field.name.placeholder': '名前を入力してください',
    'field.name.required': '名前は必須です',
    'field.email': 'メール',
    'field.email.placeholder': 'メールアドレスを入力',
    'field.email.invalid': '有効なメールアドレスを入力してください',
    'field.phone': '電話番号',
    'field.phone.placeholder': '電話番号を入力',
    'field.bio': '自己紹介',
    'field.bio.placeholder': '自己紹介を入力',
  },
}

/** 翻译函数 */
function t(locale: Locale, key: string): string {
  return I18N[locale]?.[key] ?? key
}

export const I18nForm = observer((): React.ReactElement => {
  const [locale, setLocale] = useState<Locale>('zh-CN')

  const form = useCreateForm({
    initialValues: { name: '', email: '', phone: '', bio: '' },
  })

  /**
   * 切换语言时同步更新已创建字段的属性
   *
   * fieldProps 在 JSX 中传入的值仅用于首次创建，后续语言切换需手动更新。
   */
  useEffect(() => {
    const fieldKeys: Record<string, string> = {
      name: 'field.name',
      email: 'field.email',
      phone: 'field.phone',
      bio: 'field.bio',
    }
    Object.entries(fieldKeys).forEach(([name, key]) => {
      const field = form.getField(name)
      if (field) {
        field.label = t(locale, key)
        field.setComponentProps({ placeholder: t(locale, `${key}.placeholder`) })
      }
    })
    /* 更新验证规则的国际化消息 */
    const nameField = form.getField('name')
    if (nameField)
      nameField.rules = [{ required: true, message: t(locale, 'field.name.required') }]
    const emailField = form.getField('email')
    if (emailField)
      emailField.rules = [{ format: 'email', message: t(locale, 'field.email.invalid') }]
  }, [locale]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <h3>国际化（i18n）</h3>
      <p style={{ color: 'rgba(0,0,0,0.45)' }}>多语言标签 / 验证消息国际化 / placeholder 国际化</p>

      {/* 语言切换器（附加内容） */}
      <div style={{ display: 'inline-flex', gap: 4, marginBottom: 16 }}>
        {LOCALE_OPTIONS.map(opt => (
          <button key={opt.value} type="button"
            style={{ padding: '4px 12px', background: locale === opt.value ? '#1677ff' : '#fff', color: locale === opt.value ? '#fff' : '#000', border: '1px solid #d9d9d9', borderRadius: 4, cursor: 'pointer' }}
            onClick={() => setLocale(opt.value as Locale)}>
            {opt.label}
          </button>
        ))}
      </div>

      <StatusTabs>
        {({ mode, showResult, showErrors }) => {
          form.pattern = mode
          return (
            <FormProvider form={form}>
                <FormField
                  name="name"
                  fieldProps={{
                    label: t(locale, 'field.name'),
                    required: true,
                    component: 'Input',
                    rules: [{ required: true, message: t(locale, 'field.name.required') }],
                    componentProps: { placeholder: t(locale, 'field.name.placeholder') },
                  }}
                />
                <FormField
                  name="email"
                  fieldProps={{
                    label: t(locale, 'field.email'),
                    component: 'Input',
                    rules: [{ format: 'email', message: t(locale, 'field.email.invalid') }],
                    componentProps: { placeholder: t(locale, 'field.email.placeholder') },
                  }}
                />
                <FormField
                  name="phone"
                  fieldProps={{
                    label: t(locale, 'field.phone'),
                    component: 'Input',
                    componentProps: { placeholder: t(locale, 'field.phone.placeholder') },
                  }}
                />
                <FormField
                  name="bio"
                  fieldProps={{
                    label: t(locale, 'field.bio'),
                    component: 'Textarea',
                    componentProps: { placeholder: t(locale, 'field.bio.placeholder'), rows: 3 },
                  }}
                />
                <LayoutFormActions onSubmit={showResult} onSubmitFailed={showErrors} />
            </FormProvider>
          )
        }}
      </StatusTabs>
    </div>
  )
})
