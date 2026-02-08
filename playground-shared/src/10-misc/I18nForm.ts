import type { SceneConfig } from '../types'

/**
 * 场景：国际化（i18n）
 *
 * 演示多语言标签 / 验证消息国际化 / placeholder 国际化能力。
 * 切换语言时通过 computed schema 动态更新标签和验证消息。
 */

/** 多语言翻译表 */
const I18N: Record<string, Record<string, string>> = {
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

/** 语言切换选项 */
const LOCALE_OPTIONS = [
  { label: '🇨🇳 中文', value: 'zh-CN' },
  { label: '🇺🇸 English', value: 'en-US' },
  { label: '🇯🇵 日本語', value: 'ja-JP' },
]

const config: SceneConfig & { i18n: typeof I18N; localeOptions: typeof LOCALE_OPTIONS } = {
  title: '国际化（i18n）',
  description: '多语言标签 / 验证消息国际化 — ConfigForm + Schema 实现',

  initialValues: {
    name: '',
    email: '',
    phone: '',
    bio: '',
  },

  schema: {
    type: 'object',
    decoratorProps: { labelPosition: 'right', labelWidth: '100px', actions: { submit: '提交', reset: '重置' } },
    properties: {
      name: { type: 'string', title: '姓名', required: true, rules: [{ required: true, message: '姓名为必填项' }] },
      email: { type: 'string', title: '邮箱', rules: [{ format: 'email', message: '无效邮箱' }] },
      phone: { type: 'string', title: '手机号' },
      bio: { type: 'string', title: '简介', component: 'Textarea', componentProps: { rows: 3 } },
    },
  },

  fields: [
    { name: 'name', label: '姓名', required: true, component: 'Input', rules: [{ required: true, message: '姓名为必填项' }], componentProps: { placeholder: '请输入姓名' } },
    { name: 'email', label: '邮箱', component: 'Input', rules: [{ format: 'email', message: '无效邮箱' }], componentProps: { placeholder: '请输入邮箱' } },
    { name: 'phone', label: '手机号', component: 'Input', componentProps: { placeholder: '请输入手机号' } },
    { name: 'bio', label: '简介', component: 'Textarea', componentProps: { placeholder: '请输入简介', rows: 3 } },
  ],

  /** 多语言翻译表（供实现侧使用） */
  i18n: I18N,

  /** 语言切换选项 */
  localeOptions: LOCALE_OPTIONS,
}

export default config
