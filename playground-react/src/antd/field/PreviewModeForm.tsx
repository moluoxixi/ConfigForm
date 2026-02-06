/**
 * 模式切换 - antd 版
 *
 * 覆盖场景：
 * - 4 种模式切换（editable / readOnly / disabled / preview）
 * - Card 分组布局
 * - ARIA 标签
 * - 键盘导航
 * - antd Segmented / Card / Descriptions 组件
 */
import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { FormProvider, FormField, useCreateForm } from '@moluoxixi/react';
import { setupAntd } from '@moluoxixi/ui-antd';
import {
  Button, Typography, Alert, Input, Select, InputNumber, Form, Card, Row, Col,
  Segmented, Tag, Space,
} from 'antd';
import type { FieldInstance } from '@moluoxixi/core';
import type { FieldPattern } from '@moluoxixi/shared';

const { Title, Paragraph, Text } = Typography;

setupAntd();

/** 字段定义 */
interface FieldDef {
  name: string;
  label: string;
  required?: boolean;
  group: string;
  type?: 'text' | 'number' | 'textarea' | 'select';
  rules?: Array<{ format?: string; message?: string }>;
  dataSource?: Array<{ label: string; value: string }>;
}

/** 分组定义 */
interface GroupDef {
  key: string;
  title: string;
  fields: string[];
}

/** 字段定义列表 */
const FIELD_DEFS: FieldDef[] = [
  { name: 'name', label: '姓名', required: true, group: 'basic', type: 'text' },
  { name: 'email', label: '邮箱', required: true, group: 'basic', type: 'text', rules: [{ format: 'email', message: '请输入正确邮箱' }] },
  { name: 'phone', label: '电话', group: 'basic', type: 'text' },
  {
    name: 'department',
    label: '部门',
    group: 'work',
    type: 'select',
    dataSource: [
      { label: '技术部', value: '技术部' },
      { label: '产品部', value: '产品部' },
      { label: '设计部', value: '设计部' },
      { label: '运营部', value: '运营部' },
    ],
  },
  { name: 'role', label: '职位', group: 'work', type: 'text' },
  { name: 'joinDate', label: '入职日期', group: 'work', type: 'text' },
  { name: 'salary', label: '月薪（元）', group: 'work', type: 'number' },
  { name: 'bio', label: '个人简介', group: 'extra', type: 'textarea' },
];

/** 分组列表 */
const GROUPS: GroupDef[] = [
  { key: 'basic', title: '基本信息', fields: ['name', 'email', 'phone'] },
  { key: 'work', title: '工作信息', fields: ['department', 'role', 'joinDate', 'salary'] },
  { key: 'extra', title: '补充信息', fields: ['bio'] },
];

/** 模式选项 */
const PATTERN_OPTIONS: Array<{ key: FieldPattern; label: string; color: string }> = [
  { key: 'editable', label: '编辑', color: '#1677ff' },
  { key: 'readOnly', label: '只读', color: '#52c41a' },
  { key: 'disabled', label: '禁用', color: '#faad14' },
  { key: 'preview', label: '预览', color: '#722ed1' },
];

/** 格式化展示值 */
function formatDisplayValue(name: string, value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  if (name === 'salary') return `¥${Number(value).toLocaleString()}`;
  return String(value);
}

/** 字段单元格 */
const FieldCell = observer(({
  field,
  fieldDef,
  pattern,
}: {
  field: FieldInstance;
  fieldDef: FieldDef;
  pattern: FieldPattern;
}): React.ReactElement => {
  const hasError = field.errors.length > 0;

  /* 预览模式 */
  if (pattern === 'preview') {
    return (
      <Form.Item label={field.label}>
        <Text aria-label={`${field.label}: ${formatDisplayValue(field.name, field.value)}`}>
          {formatDisplayValue(field.name, field.value)}
        </Text>
      </Form.Item>
    );
  }

  return (
    <Form.Item
      label={field.label}
      required={field.required && pattern === 'editable'}
      validateStatus={hasError ? 'error' : undefined}
      help={hasError ? field.errors[0].message : undefined}
    >
      {fieldDef.type === 'select' ? (
        <Select
          value={(field.value as string) ?? undefined}
          onChange={(val) => field.setValue(val)}
          disabled={pattern === 'disabled'}
          options={fieldDef.dataSource}
          style={{ width: '100%' }}
          aria-required={field.required || undefined}
          aria-invalid={hasError || undefined}
        />
      ) : fieldDef.type === 'textarea' ? (
        <Input.TextArea
          value={(field.value as string) ?? ''}
          onChange={(e) => field.setValue(e.target.value)}
          onBlur={() => { field.blur(); field.validate('blur').catch(() => {}); }}
          disabled={pattern === 'disabled'}
          readOnly={pattern === 'readOnly'}
          rows={3}
          aria-required={field.required || undefined}
          aria-invalid={hasError || undefined}
        />
      ) : fieldDef.type === 'number' ? (
        <InputNumber
          value={field.value as number}
          onChange={(val) => field.setValue(val)}
          onBlur={() => { field.blur(); field.validate('blur').catch(() => {}); }}
          disabled={pattern === 'disabled'}
          readOnly={pattern === 'readOnly'}
          style={{ width: '100%' }}
          aria-required={field.required || undefined}
          aria-invalid={hasError || undefined}
        />
      ) : (
        <Input
          value={(field.value as string) ?? ''}
          onChange={(e) => field.setValue(e.target.value)}
          onBlur={() => { field.blur(); field.validate('blur').catch(() => {}); }}
          disabled={pattern === 'disabled'}
          readOnly={pattern === 'readOnly'}
          aria-required={field.required || undefined}
          aria-invalid={hasError || undefined}
        />
      )}
    </Form.Item>
  );
});

/**
 * 模式切换示例
 */
export const PreviewModeForm = observer(() => {
  const [currentPattern, setCurrentPattern] = useState<FieldPattern>('editable');
  const [submitResult, setSubmitResult] = useState('');

  const form = useCreateForm({
    initialValues: {
      name: '张三',
      email: 'zhangsan@example.com',
      phone: '13800138000',
      department: '技术部',
      role: '前端工程师',
      joinDate: '2020-03-15',
      salary: 25000,
      bio: '5 年前端开发经验，擅长 Vue/React。',
    },
  });

  /* 创建字段 */
  useEffect(() => {
    for (const def of FIELD_DEFS) {
      form.createField({
        name: def.name,
        label: def.label,
        required: def.required,
        rules: def.rules as FieldDef['rules'],
        dataSource: def.dataSource,
      });
    }
  }, []);

  /** 切换模式 */
  const switchPattern = (pattern: FieldPattern): void => {
    setCurrentPattern(pattern);
    for (const def of FIELD_DEFS) {
      const field = form.getField(def.name);
      if (field) field.pattern = pattern;
    }
  };

  /** 提交 */
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    const result = await form.submit();
    if (result.errors.length > 0) {
      setSubmitResult('验证失败: ' + result.errors.map((err) => err.message).join(', '));
    } else {
      setSubmitResult(JSON.stringify(result.values, null, 2));
    }
  };

  return (
    <div>
      <Title level={3}>模式切换 - antd 版</Title>
      <Paragraph type="secondary">
        4 种模式（editable / readOnly / disabled / preview）/ Card 分组 / ARIA
      </Paragraph>

      {/* 模式切换 */}
      <div style={{ marginBottom: 20 }} role="radiogroup" aria-label="表单模式切换">
        <Segmented
          value={currentPattern}
          onChange={(val) => switchPattern(val as FieldPattern)}
          options={PATTERN_OPTIONS.map((p) => ({
            label: (
              <Space>
                <span style={{ color: p.key === currentPattern ? p.color : undefined, fontWeight: p.key === currentPattern ? 600 : 400 }}>
                  {p.label}
                </span>
              </Space>
            ),
            value: p.key,
          }))}
        />
      </div>

      {/* 当前模式提示 */}
      <Alert
        style={{ marginBottom: 16 }}
        type="info"
        showIcon
        message={
          <span role="status" aria-live="polite">
            当前模式：<strong>{PATTERN_OPTIONS.find((p) => p.key === currentPattern)?.label}</strong>
            {currentPattern === 'editable' && ' — 所有字段可编辑'}
            {currentPattern === 'readOnly' && ' — 字段可见但不可修改'}
            {currentPattern === 'disabled' && ' — 字段置灰不可操作'}
            {currentPattern === 'preview' && ' — 纯文本展示'}
          </span>
        }
      />

      <FormProvider form={form}>
        <form onSubmit={handleSubmit} noValidate>
          {GROUPS.map((group) => (
            <Card
              key={group.key}
              title={group.title}
              style={{ marginBottom: 16 }}
              role="group"
              aria-label={group.title}
            >
              <Row gutter={24}>
                {group.fields.map((fieldName) => {
                  const def = FIELD_DEFS.find((d) => d.name === fieldName);
                  if (!def) return null;
                  return (
                    <Col span={def.type === 'textarea' ? 24 : 12} key={fieldName}>
                      <FormField name={fieldName}>
                        {(field: FieldInstance) => (
                          <FieldCell field={field} fieldDef={def} pattern={currentPattern} />
                        )}
                      </FormField>
                    </Col>
                  );
                })}
              </Row>
            </Card>
          ))}

          {currentPattern === 'editable' && (
            <Button type="primary" htmlType="submit">
              提交
            </Button>
          )}
        </form>
      </FormProvider>

      {submitResult && (
        <Alert
          style={{ marginTop: 16 }}
          type={submitResult.startsWith('验证失败') ? 'error' : 'success'}
          message="提交结果"
          description={<pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: 12 }}>{submitResult}</pre>}
        />
      )}
    </div>
  );
});
