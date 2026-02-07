/**
 * Playground 通用表单包装器（React 版）
 *
 * 封装三态切换（编辑/阅读/禁用）、提交/重置按钮、结果展示。
 * 支持两种模式：
 * - Config 模式：传 schema，内部渲染 ConfigForm
 * - Field 模式：传 form 实例，内部渲染 FormProvider
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { ConfigForm, FormProvider } from '@moluoxixi/react';
import type { FormInstance } from '@moluoxixi/core';
import type { FormSchema } from '@moluoxixi/schema';
import type { FieldPattern } from '@moluoxixi/shared';
import { Alert, Button, Segmented, Space } from 'antd';

const MODE_OPTIONS = [
  { label: '编辑态', value: 'editable' },
  { label: '阅读态', value: 'readOnly' },
  { label: '禁用态', value: 'disabled' },
];

export interface PlaygroundFormProps {
  /** Config 模式：传 schema */
  schema?: FormSchema;
  /** Field 模式：传 form 实例 */
  form?: FormInstance;
  /** 初始值（Config 模式用） */
  initialValues?: Record<string, unknown>;
  /** 结果区标题 */
  resultTitle?: string;
  /** Field 模式：自定义渲染 */
  children?: React.ReactNode | ((ctx: { form: FormInstance; mode: FieldPattern }) => React.ReactNode);
}

export const PlaygroundForm = observer(({
  schema,
  form,
  initialValues,
  resultTitle = '提交结果',
  children,
}: PlaygroundFormProps): React.ReactElement => {
  const [mode, setMode] = useState<FieldPattern>('editable');
  const [result, setResult] = useState('');
  const [savedValues, setSavedValues] = useState<Record<string, unknown>>({ ...initialValues });

  /** Config 模式：将 mode 注入 schema.form.pattern */
  const schemaWithPattern = useMemo<FormSchema | undefined>(() => {
    if (!schema) return undefined;
    return { ...schema, form: { ...schema.form, pattern: mode } };
  }, [schema, mode]);

  /** Field 模式：同步 mode → form.pattern */
  useEffect(() => {
    if (form) { form.pattern = mode; }
  }, [form, mode]);

  /** Field 模式提交 */
  const handleFieldSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    const res = await form.submit();
    if (res.errors.length > 0) {
      setResult(`验证失败:\n${res.errors.map(err => `[${err.path}] ${err.message}`).join('\n')}`);
    } else {
      setResult(JSON.stringify(res.values, null, 2));
    }
  }, [form]);

  const childContent = typeof children === 'function'
    ? children({ form: form!, mode })
    : children;

  return (
    <>
      <Segmented
        value={mode}
        onChange={(v) => setMode(v as FieldPattern)}
        options={MODE_OPTIONS}
        style={{ marginBottom: 16 }}
      />

      {/* Config 模式 */}
      {schemaWithPattern && (
        <ConfigForm
          key={mode}
          schema={schemaWithPattern}
          initialValues={savedValues}
          onValuesChange={(v) => setSavedValues(v as Record<string, unknown>)}
          onSubmit={(v) => setResult(JSON.stringify(v, null, 2))}
          onSubmitFailed={(errors) =>
            setResult(`验证失败:\n${errors.map(e => `[${e.path}] ${e.message}`).join('\n')}`)
          }
        >
          {childContent ?? (mode === 'editable' && (
            <Space style={{ marginTop: 16 }}>
              <Button type="primary" htmlType="submit">提交</Button>
              <Button htmlType="reset">重置</Button>
            </Space>
          ))}
        </ConfigForm>
      )}

      {/* Field 模式 */}
      {!schema && form && (
        <FormProvider form={form}>
          <form onSubmit={handleFieldSubmit} noValidate>
            {childContent}
            {mode === 'editable' && (
              <Space style={{ marginTop: 16 }}>
                <Button type="primary" htmlType="submit">提交</Button>
                <Button onClick={() => form.reset()}>重置</Button>
              </Space>
            )}
          </form>
        </FormProvider>
      )}

      {result && (
        <Alert
          style={{ marginTop: 16 }}
          type={result.startsWith('验证失败') ? 'error' : 'success'}
          message={resultTitle}
          description={<pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{result}</pre>}
        />
      )}
    </>
  );
});
