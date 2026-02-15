import type { SceneConfig } from '../types'

/**
 * 场景：国际化（i18n）
 *
 * 演示多语言标签 / 验证消息国际化 / placeholder 国际化能力。
 * 切换语言时通过 computed schema 动态更新标签和验证消息。
 */

/** 多语言翻译表 */
const I18N_MESSAGES: Record<string, Record<string, string>> = {
  'zh-CN': {
    'scene.title': '国际化（i18n）',
    'scene.desc': '多语言标签 / 验证消息国际化 / placeholder 国际化能力（真实 i18n 适配）',
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
    'scene.title': 'Internationalization (i18n)',
    'scene.desc': 'Localized labels, validation messages, and placeholders (real i18n adapter)',
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
    'scene.title': '国際化（i18n）',
    'scene.desc': '多言語ラベル・検証メッセージ・プレースホルダ対応（実 i18n）',
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

const config: SceneConfig & { i18n: { messages: typeof I18N_MESSAGES, defaultLocale: string }, localeOptions: typeof LOCALE_OPTIONS } = {
  title: '$t:scene.title',
  description: '$t:scene.desc',

  initialValues: {
    name: '张三',
    email: 'zhangsan@example.com',
    phone: '+86-13800001234',
    bio: '初始简介：用于验证重置回填',
  },

  schema: {
    type: 'object',
    decoratorProps: {
      labelPosition: 'right',
      labelWidth: '100px',
      actions: {
        submit: '$t:btn.submit',
        reset: '$t:btn.reset',
      },
    },
    properties: {
      name: {
        type: 'string',
        title: '$t:field.name',
        required: true,
        rules: [{ required: true, message: '$t:field.name.required' }],
        componentProps: { placeholder: '$t:field.name.placeholder' },
      },
      email: {
        type: 'string',
        title: '$t:field.email',
        rules: [{ format: 'email', message: '$t:field.email.invalid' }],
        componentProps: { placeholder: '$t:field.email.placeholder' },
      },
      phone: {
        type: 'string',
        title: '$t:field.phone',
        componentProps: { placeholder: '$t:field.phone.placeholder' },
      },
      bio: {
        type: 'string',
        title: '$t:field.bio',
        component: 'Textarea',
        componentProps: { rows: 3, placeholder: '$t:field.bio.placeholder' },
      },
    },
  },

  fields: [
    { name: 'name', label: '$t:field.name', required: true, component: 'Input', rules: [{ required: true, message: '$t:field.name.required' }], componentProps: { placeholder: '$t:field.name.placeholder' } },
    { name: 'email', label: '$t:field.email', component: 'Input', rules: [{ format: 'email', message: '$t:field.email.invalid' }], componentProps: { placeholder: '$t:field.email.placeholder' } },
    { name: 'phone', label: '$t:field.phone', component: 'Input', componentProps: { placeholder: '$t:field.phone.placeholder' } },
    { name: 'bio', label: '$t:field.bio', component: 'Textarea', componentProps: { placeholder: '$t:field.bio.placeholder', rows: 3 } },
  ],

  /** 多语言翻译表（供实现侧使用） */
  i18n: {
    messages: I18N_MESSAGES,
    defaultLocale: 'zh-CN',
  },

  /** 语言切换选项 */
  localeOptions: LOCALE_OPTIONS,
}

export default config
