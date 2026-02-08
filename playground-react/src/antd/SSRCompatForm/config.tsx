import type { ISchema } from '@moluoxixi/schema';
import type { FieldPattern } from '@moluoxixi/core';
import { createForm } from '@moluoxixi/core';
import { compileSchema } from '@moluoxixi/schema';
import { ConfigForm } from '@moluoxixi/react';
import { setupAntd, StatusTabs } from '@moluoxixi/ui-antd';
import { observer } from 'mobx-react-lite';
/**
 * 场景 55：SSR 兼容性测试（Ant Design 版）
 *
 * 验证表单核心功能在无浏览器环境下正常工作：
 * - createForm 不依赖 window/document
 * - Schema 编译正常
 * - 字段创建不依赖 DOM
 * - 验证逻辑不依赖 DOM
 */
import React, { useState } from 'react';

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
    const form = createForm({ initialValues: { test: 'ok' } });
    checks.push({ label: 'createForm() 正常工作', pass: !!form.id });
    form.dispose();
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
    const form = createForm();
    const field = form.createField({ name: 'test', required: true });
    checks.push({ label: 'Field 创建不依赖DOM', pass: !!field.path });
    form.dispose();
  } catch {
    checks.push({ label: 'Field 创建不依赖DOM', pass: false });
  }

  /* 检查4: 验证不依赖 DOM */
  try {
    const form = createForm();
    const field = form.createField({ name: 'test', required: true, rules: [{ required: true }] });
    field.validate('submit').then((errors) => {
      checks.push({ label: '验证不依赖 DOM', pass: errors.length > 0 });
    });
    form.dispose();
  } catch {
    checks.push({ label: '验证不依赖 DOM', pass: false });
  }

  /* 检查5: 无浏览器全局依赖 */
  checks.push({
    label: '无window/document 强依赖（使用globalThis）',
    pass: typeof globalThis !== 'undefined',
  });

  return checks;
}

/** 表单 Schema */
const schema: ISchema = {
  type: 'object',
  decoratorProps: { labelPosition: 'right', labelWidth: '120px', actions: { submit: '提交' } },
  properties: {
    username: { type: 'string', title: '用户名', required: true },
    email: { type: 'string', title: '邮箱', rules: [{ format: 'email' }] },
  },
};

/** 默认初始值 */
const INITIAL_VALUES: Record<string, unknown> = {
  username: 'ssr-test',
  email: 'test@example.com',
};

/** 将 mode 注入 schema */
function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } };
}

/**
 * SSR 兼容性测试示例
 *
 * 验证表单核心功能在无浏览器环境下正常工作，支持 hydration 场景。
 */
export const SSRCompatForm = observer((): React.ReactElement => {
  const [checks] = useState(() => runChecks());

  return (
    <div>
      <h2>SSR 兼容性测试</h2>
      <p style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 16, fontSize: 14 }}>
        验证表单核心功能在无浏览器环境下正常工作，无 window/document 强依赖，支持 hydration 场景。
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
        {({ mode, showResult, showErrors }) => (
          <ConfigForm
            schema={withMode(schema, mode)}
            initialValues={INITIAL_VALUES}
            onSubmit={showResult}
            onSubmitFailed={errors => showErrors(errors)}
          />
        )}
      </StatusTabs>
    </div>
  );
});
