import type { ISchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/shared'
import { ConfigForm } from '@moluoxixi/react'
import { setupAntd, StatusTabs } from '@moluoxixi/ui-antd'
import { observer } from 'mobx-react-lite'
/**
 * 场景 46：国际化 — ConfigForm + Schema
 *
 * 覆盖：
 * - 多语言标签切换
 * - 验证消息国际化
 * - placeholder 国际化
 * - 三种模式切换
 *
 * 通过动态生成 schema 实现语言切换，切换时重新生成 schema 传入 ConfigForm。
 */
import React, { useState } from 'react'

setupAntd()

/** 工具：将 StatusTabs 的 mode 注入 schema */
function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}

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
    'action.submit': '提交',
    'action.reset': '重置',
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
    'action.submit': 'Submit',
    'action.reset': 'Reset',
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
    'action.submit': '送信',
    'action.reset': 'リセット',
  },
}

/** 翻译函数 */
function t(locale: Locale, key: string): string {
  return I18N[locale]?.[key] ?? key
}

/** 默认初始值 */
const INITIAL_VALUES: Record<string, unknown> = {
  name: '',
  email: '',
  phone: '',
  bio: '',
}

/**
 * 根据语言动态生成表单 Schema
 *
 * @param locale - 当前语言
 * @returns 带有国际化标签/placeholder/验证消息的 Schema
 */
function createSchema(locale: Locale): ISchema {
  return {
    type: 'object',
    decoratorProps: {
      labelPosition: 'right',
      labelWidth: '120px',
      actions: { submit: t(locale, 'action.submit'), reset: t(locale, 'action.reset') },
    },
    properties: {
      name: {
        type: 'string',
        title: t(locale, 'field.name'),
        required: true,
        placeholder: t(locale, 'field.name.placeholder'),
        rules: [{ required: true, message: t(locale, 'field.name.required') }],
      },
      email: {
        type: 'string',
        title: t(locale, 'field.email'),
        placeholder: t(locale, 'field.email.placeholder'),
        rules: [{ format: 'email', message: t(locale, 'field.email.invalid') }],
      },
      phone: {
        type: 'string',
        title: t(locale, 'field.phone'),
        placeholder: t(locale, 'field.phone.placeholder'),
      },
      bio: {
        type: 'string',
        title: t(locale, 'field.bio'),
        component: 'Textarea',
        componentProps: { rows: 3 },
        placeholder: t(locale, 'field.bio.placeholder'),
      },
    },
  }
}

/**
 * 国际化表单 — ConfigForm + Schema
 *
 * 展示多语言标签切换、验证消息国际化、placeholder 国际化
 */
export const I18nForm = observer((): React.ReactElement => {
  const [locale, setLocale] = useState<Locale>('zh-CN')

  return (
    <div>
      <h2>国际化（i18n）</h2>
      <p style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 16, fontSize: 14 }}>多语言标签 / 验证消息国际化 / placeholder 国际化 — ConfigForm + Schema</p>

      {/* 语言切换器 */}
      <div style={{ display: 'inline-flex', gap: 0, marginBottom: 16, border: '1px solid #d9d9d9', borderRadius: 6, overflow: 'hidden' }}>
        {LOCALE_OPTIONS.map(opt => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setLocale(opt.value as Locale)}
            style={{
              padding: '4px 12px',
              border: 'none',
              cursor: 'pointer',
              fontSize: 14,
              background: locale === opt.value ? '#1677ff' : '#fff',
              color: locale === opt.value ? '#fff' : 'rgba(0,0,0,0.88)',
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <StatusTabs>
        {({ mode, showResult, showErrors }) => (
          <ConfigForm
            schema={withMode(createSchema(locale), mode)}
            initialValues={INITIAL_VALUES}
            onSubmit={showResult}
            onSubmitFailed={errors => showErrors(errors)}
          />
        )}
      </StatusTabs>
    </div>
  )
})
