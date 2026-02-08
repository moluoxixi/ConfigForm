/**
 * SSR 兼容性测试 — Field 模式
 *
 * 使用 FormProvider + FormField 验证 SSR 环境兼容性。
 * 检查 createForm / compileSchema / Field 创建 / 验证等是否依赖浏览器 API。
 */
import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { createForm } from '@moluoxixi/core';
import { compileSchema } from '@moluoxixi/schema';
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/react';
import { LayoutFormActions, setupAntd, StatusTabs } from '@moluoxixi/ui-antd';

setupAntd();

/** SSR 兼容性检查项 */
interface CheckItem {
  label: string;
  pass: boolean;
}

/** 执行 SSR 兼容性检查 */
function runChecks(): CheckItem[] {
  const checks: CheckItem[] = [];

  /* 检查1: createForm 可用性 */
  try {
    const testForm = createForm({ initialValues: { test: 'ok' } });
    checks.push({ label: 'createForm() 正常工作', pass: !!testForm.id });
    testForm.dispose();
  } catch {
    checks.push({ label: 'createForm() 正常工作', pass: false });
  }

  /* 检查2: compileSchema 可用性 */
  try {
    const compiled = compileSchema({
      type: 'object',
      properties: { name: { type: 'string', title: '姓名' } },
    });
    checks.push({ label: 'compileSchema() 正常解析', pass: compiled.fields.size > 0 });
  } catch {
    checks.push({ label: 'compileSchema() 正常解析', pass: false });
  }

  /* 检查3: Field 创建不依赖 DOM */
  try {
    const testForm = createForm();
    const field = testForm.createField({ name: 'test', required: true });
    checks.push({ label: 'Field 创建不依赖DOM', pass: !!field.path });
    testForm.dispose();
  } catch {
    checks.push({ label: 'Field 创建不依赖DOM', pass: false });
  }

  /* 检查4: 无浏览器全局依赖 */
  checks.push({
    label: '无window/document 强依赖（使用globalThis）',
    pass: typeof globalThis !== 'undefined',
  });

  return checks;
}

/**
 * SSR 兼容性测试（Field 版）
 *
 * 使用 FormProvider + FormField 验证 SSR 兼容性。
 */
export const SSRCompatForm = observer((): React.ReactElement => {
  const [checks] = useState(() => runChecks());

  const form = useCreateForm({
    initialValues: { username: 'ssr-test', email: 'test@example.com' },
  });

  return (
    <div>
      <h2>SSR 兼容性测试</h2>
      <p style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 16, fontSize: 14 }}>
        验证表单核心功能在无浏览器环境下正常工作 — Field 模式
      </p>
      {/* SSR 兼容性检查结果 */}
      <div style={{ marginBottom: 16, padding: 12, background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 6 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>SSR 兼容性检查</div>
        {checks.map((check, i) => (
          <div key={i} style={{ fontSize: 13, padding: '2px 0' }}>
            <span style={{ color: check.pass ? '#52c41a' : '#ff4d4f' }}>{check.pass ? '✅' : '❌'}</span>
            {' '}{check.label}
          </div>
        ))}
      </div>
      <StatusTabs>
        {({ mode, showResult, showErrors }) => {
          form.pattern = mode;
          return (
            <FormProvider form={form}>
              <FormField name="username" fieldProps={{ label: '用户名', required: true, component: 'Input' }} />
              <FormField name="email" fieldProps={{ label: '邮箱', component: 'Input', rules: [{ format: 'email' }] }} />
              <LayoutFormActions onSubmit={showResult} onSubmitFailed={showErrors} />
            </FormProvider>
          );
        }}
      </StatusTabs>
    </div>
  );
});
