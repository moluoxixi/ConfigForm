/**
 * 场景 46：国际化
 *
 * 覆盖：
 * - 多语言标签切换
 * - 验证消息国际化
 * - placeholder 国际化
 * - 三种模式切换
 */
import React, { useState, useEffect, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { FormProvider, FormField, useCreateForm } from '@moluoxixi/react';
import { setupAntd } from '@moluoxixi/ui-antd';
import { Button, Typography, Alert, Segmented, Form, Input, Space } from 'antd';
import type { FieldInstance } from '@moluoxixi/core';
import type { FieldPattern } from '@moluoxixi/shared';

const { Title, Paragraph } = Typography;

setupAntd();

const MODE_OPTIONS = [
  { label: '编辑态', value: 'editable' },
  { label: '阅读态', value: 'readOnly' },
  { label: '禁用态', value: 'disabled' },
];

type Locale = 'zh-CN' | 'en-US' | 'ja-JP';

/** 国际化资源 */
const I18N: Record<Locale, Record<string, string>> = {
  'zh-CN': {
    'form.title': '用户注册',
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
    'btn.submit': '提交',
    'btn.reset': '重置',
  },
  'en-US': {
    'form.title': 'User Registration',
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
    'btn.submit': 'Submit',
    'btn.reset': 'Reset',
  },
  'ja-JP': {
    'form.title': 'ユーザー登録',
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
    'btn.submit': '送信',
    'btn.reset': 'リセット',
  },
};

/** 翻译函数 */
function t(locale: Locale, key: string): string {
  return I18N[locale]?.[key] ?? key;
}

export const I18nForm = observer((): React.ReactElement => {
  const [mode, setMode] = useState<FieldPattern>('editable');
  const [locale, setLocale] = useState<Locale>('zh-CN');
  const [result, setResult] = useState('');

  const form = useCreateForm({
    initialValues: { name: '', email: '', phone: '', bio: '' },
  });

  useEffect(() => {
    form.createField({ name: 'name', label: t(locale, 'field.name'), required: true, rules: [{ required: true, message: t(locale, 'field.name.required') }] });
    form.createField({ name: 'email', label: t(locale, 'field.email'), rules: [{ format: 'email', message: t(locale, 'field.email.invalid') }] });
    form.createField({ name: 'phone', label: t(locale, 'field.phone') });
    form.createField({ name: 'bio', label: t(locale, 'field.bio') });
  }, []);

  /** 切换语言时更新标签和占位符 */
  useEffect(() => {
    const fieldMap: Record<string, string> = { name: 'field.name', email: 'field.email', phone: 'field.phone', bio: 'field.bio' };
    Object.entries(fieldMap).forEach(([name, key]) => {
      const field = form.getField(name);
      if (field) {
        field.label = t(locale, key);
        field.setComponentProps({ placeholder: t(locale, `${key}.placeholder`) });
      }
    });
    /* 更新验证消息 */
    const nameField = form.getField('name');
    if (nameField) nameField.rules = [{ required: true, message: t(locale, 'field.name.required') }];
    const emailField = form.getField('email');
    if (emailField) emailField.rules = [{ format: 'email', message: t(locale, 'field.email.invalid') }];
  }, [locale]);

  const switchMode = (p: FieldPattern): void => {
    setMode(p);
    ['name', 'email', 'phone', 'bio'].forEach((n) => { const f = form.getField(n); if (f) f.pattern = p; });
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    const res = await form.submit();
    if (res.errors.length > 0) { setResult('验证失败: ' + res.errors.map((err) => err.message).join(', ')); }
    else { setResult(JSON.stringify(res.values, null, 2)); }
  };

  return (
    <div>
      <Title level={3}>国际化（i18n）</Title>
      <Paragraph type="secondary">多语言标签 / 验证消息国际化 / placeholder 国际化</Paragraph>

      <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
        <Segmented value={mode} onChange={(v) => switchMode(v as FieldPattern)} options={MODE_OPTIONS} />
        <Segmented
          value={locale}
          onChange={(v) => setLocale(v as Locale)}
          options={[{ label: '🇨🇳 中文', value: 'zh-CN' }, { label: '🇺🇸 English', value: 'en-US' }, { label: '🇯🇵 日本語', value: 'ja-JP' }]}
        />
      </Space>

      <FormProvider form={form}>
        <form onSubmit={handleSubmit} noValidate>
          {['name', 'email', 'phone', 'bio'].map((name) => (
            <FormField key={name} name={name}>
              {(field: FieldInstance) => (
                <Form.Item label={field.label} required={field.required} validateStatus={field.errors.length > 0 ? 'error' : undefined} help={field.errors[0]?.message}>
                  {name === 'bio' ? (
                    <Input.TextArea value={(field.value as string) ?? ''} onChange={(e) => field.setValue(e.target.value)} onBlur={() => { field.blur(); field.validate('blur').catch(() => {}); }} disabled={mode === 'disabled'} readOnly={mode === 'readOnly'} placeholder={t(locale, `field.${name}.placeholder`)} rows={3} />
                  ) : (
                    <Input value={(field.value as string) ?? ''} onChange={(e) => field.setValue(e.target.value)} onBlur={() => { field.blur(); field.validate('blur').catch(() => {}); }} disabled={mode === 'disabled'} readOnly={mode === 'readOnly'} placeholder={t(locale, `field.${name}.placeholder`)} />
                  )}
                </Form.Item>
              )}
            </FormField>
          ))}
          {mode === 'editable' && (
            <Space>
              <Button type="primary" htmlType="submit">{t(locale, 'btn.submit')}</Button>
              <Button htmlType="reset">{t(locale, 'btn.reset')}</Button>
            </Space>
          )}
        </form>
      </FormProvider>

      {result && (<Alert style={{ marginTop: 16 }} type={result.startsWith('验证失败') ? 'error' : 'success'} message="提交结果" description={<pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{result}</pre>} />)}
    </div>
  );
});
