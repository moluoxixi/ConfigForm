/**
 * 自定义组件 - antd 版
 *
 * 覆盖场景：
 * - render prop 自定义渲染（使用 antd Input / Password / Checkbox）
 * - 跨字段验证（密码确认）
 * - 密码强度指示器
 * - 自定义协议勾选
 */
import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { FormProvider, FormField, useCreateForm } from '@moluoxixi/react';
import { setupAntd } from '@moluoxixi/ui-antd';
import {
  Button, Typography, Alert, Input, Checkbox, Form, Progress, Space,
} from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import type { FieldInstance } from '@moluoxixi/core';

const { Title, Paragraph, Text } = Typography;

setupAntd();

/** 密码强度等级 */
const PASSWORD_STRENGTH_LEVELS = [
  { label: '弱', color: '#ff4d4f', percent: 25 },
  { label: '中', color: '#faad14', percent: 50 },
  { label: '强', color: '#52c41a', percent: 75 },
  { label: '很强', color: '#1677ff', percent: 100 },
];

/** 计算密码强度 */
function getPasswordStrength(pwd: string): number {
  if (!pwd) return 0;
  let strength = 0;
  if (pwd.length >= 8) strength++;
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
  if (/\d/.test(pwd)) strength++;
  if (/[^a-zA-Z0-9]/.test(pwd)) strength++;
  return Math.min(strength, 4);
}

/**
 * 自定义组件示例
 *
 * 使用 FormField + render prop 实现注册表单，包含密码强度指示器和跨字段验证。
 */
export const CustomFieldForm = observer(() => {
  const form = useCreateForm({
    initialValues: {
      username: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      agree: false,
    },
  });

  /* 创建字段 */
  React.useEffect(() => {
    form.createField({
      name: 'username',
      label: '用户名',
      required: true,
      rules: [
        { minLength: 3, message: '用户名至少 3 个字符' },
        { maxLength: 20, message: '用户名最多 20 个字符' },
        { pattern: /^[a-zA-Z0-9_]+$/, message: '只能包含字母、数字和下划线' },
      ],
    });
    form.createField({
      name: 'email',
      label: '邮箱',
      required: true,
      rules: [{ format: 'email', message: '请输入有效的邮箱' }],
    });
    form.createField({
      name: 'phone',
      label: '手机号',
      rules: [{ format: 'phone', message: '请输入有效的手机号' }],
    });
    form.createField({
      name: 'password',
      label: '密码',
      required: true,
      rules: [
        { minLength: 8, message: '密码至少 8 个字符' },
        {
          pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
          message: '需包含大小写字母和数字',
        },
      ],
    });
    form.createField({
      name: 'confirmPassword',
      label: '确认密码',
      required: true,
      rules: [
        {
          validator: (value, _rule, context) => {
            const pwd = context.getFieldValue('password');
            if (value !== pwd) return '两次密码不一致';
          },
        },
      ],
    });
    form.createField({
      name: 'agree',
      label: '同意条款',
      rules: [
        {
          validator: (value) => {
            if (!value) return '请阅读并同意用户协议';
          },
        },
      ],
    });
  }, []);

  const [result, setResult] = useState('');

  /** 提交 */
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    const res = await form.submit();
    if (res.errors.length > 0) {
      setResult('验证失败: ' + res.errors.map((err) => err.message).join(', '));
    } else {
      setResult(JSON.stringify(res.values, null, 2));
    }
  };

  return (
    <div>
      <Title level={3}>自定义组件 - antd 版</Title>
      <Paragraph type="secondary">
        render prop 自定义渲染 / 跨字段验证（密码确认）/ 密码强度 / 自定义 Checkbox
      </Paragraph>

      <div style={{ maxWidth: 480 }}>
        <FormProvider form={form}>
          <form onSubmit={handleSubmit} noValidate>
            {/* 用户名 */}
            <FormField name="username">
              {(field: FieldInstance) => (
                <Form.Item
                  label={field.label}
                  required={field.required}
                  validateStatus={field.errors.length > 0 ? 'error' : undefined}
                  help={field.errors[0]?.message}
                >
                  <Input
                    prefix={<UserOutlined />}
                    value={(field.value as string) ?? ''}
                    onChange={(e) => field.setValue(e.target.value)}
                    onFocus={() => field.focus()}
                    onBlur={() => { field.blur(); field.validate('blur').catch(() => {}); }}
                    placeholder="请输入用户名"
                  />
                </Form.Item>
              )}
            </FormField>

            {/* 邮箱 */}
            <FormField name="email">
              {(field: FieldInstance) => (
                <Form.Item
                  label={field.label}
                  required={field.required}
                  validateStatus={field.errors.length > 0 ? 'error' : undefined}
                  help={field.errors[0]?.message}
                >
                  <Input
                    prefix={<MailOutlined />}
                    value={(field.value as string) ?? ''}
                    onChange={(e) => field.setValue(e.target.value)}
                    onBlur={() => { field.blur(); field.validate('blur').catch(() => {}); }}
                    placeholder="请输入邮箱"
                  />
                </Form.Item>
              )}
            </FormField>

            {/* 手机号 */}
            <FormField name="phone">
              {(field: FieldInstance) => (
                <Form.Item
                  label={field.label}
                  validateStatus={field.errors.length > 0 ? 'error' : undefined}
                  help={field.errors[0]?.message}
                >
                  <Input
                    prefix={<PhoneOutlined />}
                    value={(field.value as string) ?? ''}
                    onChange={(e) => field.setValue(e.target.value)}
                    onBlur={() => { field.blur(); field.validate('blur').catch(() => {}); }}
                    placeholder="请输入手机号（选填）"
                  />
                </Form.Item>
              )}
            </FormField>

            {/* 密码 + 强度指示 */}
            <FormField name="password">
              {(field: FieldInstance) => {
                const strength = getPasswordStrength((field.value as string) ?? '');
                const level = strength > 0 ? PASSWORD_STRENGTH_LEVELS[strength - 1] : null;
                return (
                  <Form.Item
                    label={field.label}
                    required={field.required}
                    validateStatus={field.errors.length > 0 ? 'error' : undefined}
                    help={field.errors[0]?.message}
                  >
                    <Input.Password
                      prefix={<LockOutlined />}
                      value={(field.value as string) ?? ''}
                      onChange={(e) => field.setValue(e.target.value)}
                      onBlur={() => { field.blur(); field.validate('blur').catch(() => {}); }}
                      placeholder="请输入密码"
                    />
                    {(field.value as string)?.length > 0 && level && (
                      <div style={{ marginTop: 4 }}>
                        <Progress
                          percent={level.percent}
                          strokeColor={level.color}
                          showInfo={false}
                          size="small"
                        />
                        <Text style={{ fontSize: 12, color: level.color }}>密码强度：{level.label}</Text>
                      </div>
                    )}
                  </Form.Item>
                );
              }}
            </FormField>

            {/* 确认密码 */}
            <FormField name="confirmPassword">
              {(field: FieldInstance) => (
                <Form.Item
                  label={field.label}
                  required={field.required}
                  validateStatus={field.errors.length > 0 ? 'error' : undefined}
                  help={field.errors[0]?.message}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    value={(field.value as string) ?? ''}
                    onChange={(e) => field.setValue(e.target.value)}
                    onBlur={() => { field.blur(); field.validate('blur').catch(() => {}); }}
                    placeholder="请再次输入密码"
                  />
                </Form.Item>
              )}
            </FormField>

            {/* 同意协议 */}
            <FormField name="agree">
              {(field: FieldInstance) => (
                <Form.Item
                  validateStatus={field.errors.length > 0 ? 'error' : undefined}
                  help={field.errors[0]?.message}
                >
                  <Checkbox
                    checked={!!field.value}
                    onChange={(e) => field.setValue(e.target.checked)}
                  >
                    我已阅读并同意 <a href="#" onClick={(e) => e.preventDefault()}>《用户协议》</a> 和 <a href="#" onClick={(e) => e.preventDefault()}>《隐私政策》</a>
                  </Checkbox>
                </Form.Item>
              )}
            </FormField>

            <Button type="primary" htmlType="submit" block size="large">
              注册
            </Button>
          </form>
        </FormProvider>
      </div>

      {result && (
        <Alert
          style={{ marginTop: 16 }}
          type={result.startsWith('验证失败') ? 'error' : 'success'}
          message="结果"
          description={<pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{result}</pre>}
        />
      )}
    </div>
  );
});
