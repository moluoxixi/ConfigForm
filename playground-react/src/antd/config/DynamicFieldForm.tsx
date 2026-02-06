/**
 * 场景 25：动态增删字段
 *
 * 覆盖：
 * - 运行时动态添加字段
 * - 运行时移除字段
 * - 动态字段参与验证和提交
 * - 三种模式切换
 */
import React, { useState, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { FormProvider, FormField, useCreateForm } from '@moluoxixi/react';
import { setupAntd } from '@moluoxixi/ui-antd';
import {
  Button, Space, Typography, Alert, Segmented, Input, Select, Form, Tag, Card,
} from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { FieldInstance } from '@moluoxixi/core';
import type { FieldPattern } from '@moluoxixi/shared';

const { Title, Paragraph, Text } = Typography;

setupAntd();

const MODE_OPTIONS = [
  { label: '编辑态', value: 'editable' },
  { label: '阅读态', value: 'readOnly' },
  { label: '禁用态', value: 'disabled' },
];

/** 可添加的字段类型 */
const FIELD_TYPE_OPTIONS = [
  { label: '文本', value: 'text' },
  { label: '数字', value: 'number' },
  { label: '选择', value: 'select' },
  { label: '开关', value: 'switch' },
];

/** 动态字段信息 */
interface DynamicFieldInfo {
  id: string;
  name: string;
  label: string;
  fieldType: string;
}

/** 计数器 */
let fieldCounter = 0;

export const DynamicFieldForm = observer((): React.ReactElement => {
  const [mode, setMode] = useState<FieldPattern>('editable');
  const [result, setResult] = useState('');
  const [dynamicFields, setDynamicFields] = useState<DynamicFieldInfo[]>([]);
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldType, setNewFieldType] = useState('text');

  const form = useCreateForm({ initialValues: { title: '' } });

  React.useEffect(() => {
    form.createField({ name: 'title', label: '表单标题', required: true });
  }, []);

  /** 添加字段 */
  const addField = useCallback((): void => {
    if (!newFieldLabel.trim()) return;
    fieldCounter += 1;
    const id = `dynamic_${fieldCounter}`;
    const info: DynamicFieldInfo = { id, name: id, label: newFieldLabel.trim(), fieldType: newFieldType };

    form.createField({
      name: id,
      label: info.label,
      required: false,
      pattern: mode,
    });

    setDynamicFields((prev) => [...prev, info]);
    setNewFieldLabel('');
  }, [newFieldLabel, newFieldType, form, mode]);

  /** 移除字段 */
  const removeField = useCallback((id: string): void => {
    form.removeField(id);
    setDynamicFields((prev) => prev.filter((f) => f.id !== id));
  }, [form]);

  /** 切换模式 */
  const switchMode = (p: FieldPattern): void => {
    setMode(p);
    const titleField = form.getField('title');
    if (titleField) titleField.pattern = p;
    dynamicFields.forEach((df) => {
      const field = form.getField(df.name);
      if (field) field.pattern = p;
    });
  };

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

  /** 渲染动态字段组件 */
  const renderDynamicField = (field: FieldInstance, fieldType: string): React.ReactElement => {
    if (fieldType === 'select') {
      return (
        <Select
          value={(field.value as string) ?? undefined}
          onChange={(v) => field.setValue(v)}
          options={[{ label: '选项 A', value: 'a' }, { label: '选项 B', value: 'b' }, { label: '选项 C', value: 'c' }]}
          placeholder="请选择"
          style={{ width: '100%' }}
          disabled={mode === 'disabled'}
        />
      );
    }
    return (
      <Input
        value={(field.value as string) ?? ''}
        onChange={(e) => field.setValue(e.target.value)}
        placeholder={`请输入${field.label}`}
        disabled={mode === 'disabled'}
        readOnly={mode === 'readOnly'}
      />
    );
  };

  return (
    <div>
      <Title level={3}>动态增删字段</Title>
      <Paragraph type="secondary">运行时添加 / 移除字段 / 动态字段参与验证提交</Paragraph>

      <Segmented value={mode} onChange={(v) => switchMode(v as FieldPattern)} options={MODE_OPTIONS} style={{ marginBottom: 16 }} />

      {/* 添加字段面板 */}
      {mode === 'editable' && (
        <Card size="small" title="添加新字段" style={{ marginBottom: 16 }}>
          <Space>
            <Input
              value={newFieldLabel}
              onChange={(e) => setNewFieldLabel(e.target.value)}
              placeholder="字段标签"
              style={{ width: 200 }}
            />
            <Select
              value={newFieldType}
              onChange={(v) => setNewFieldType(v)}
              options={FIELD_TYPE_OPTIONS}
              style={{ width: 120 }}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={addField} disabled={!newFieldLabel.trim()}>
              添加
            </Button>
          </Space>
          <div style={{ marginTop: 8 }}>
            <Text type="secondary">已添加 {dynamicFields.length} 个动态字段</Text>
          </div>
        </Card>
      )}

      <FormProvider form={form}>
        <form onSubmit={handleSubmit} noValidate>
          {/* 固定字段 */}
          <FormField name="title">
            {(field: FieldInstance) => (
              <Form.Item label={field.label} required={field.required} validateStatus={field.errors.length > 0 ? 'error' : undefined} help={field.errors[0]?.message}>
                <Input
                  value={(field.value as string) ?? ''}
                  onChange={(e) => field.setValue(e.target.value)}
                  onBlur={() => { field.blur(); field.validate('blur').catch(() => {}); }}
                  disabled={mode === 'disabled'}
                  readOnly={mode === 'readOnly'}
                  placeholder="请输入表单标题"
                />
              </Form.Item>
            )}
          </FormField>

          {/* 动态字段 */}
          {dynamicFields.map((df) => (
            <FormField key={df.id} name={df.name}>
              {(field: FieldInstance) => (
                <Form.Item
                  label={
                    <Space>
                      {field.label}
                      <Tag color="blue" style={{ fontSize: 11 }}>{df.fieldType}</Tag>
                    </Space>
                  }
                >
                  <Space style={{ width: '100%' }}>
                    <div style={{ flex: 1 }}>{renderDynamicField(field, df.fieldType)}</div>
                    {mode === 'editable' && (
                      <Button danger icon={<DeleteOutlined />} onClick={() => removeField(df.id)} />
                    )}
                  </Space>
                </Form.Item>
              )}
            </FormField>
          ))}

          {mode === 'editable' && (
            <Button type="primary" htmlType="submit" style={{ marginTop: 8 }}>提交</Button>
          )}
        </form>
      </FormProvider>

      {result && (<Alert style={{ marginTop: 16 }} type={result.startsWith('验证失败') ? 'error' : 'success'} message="提交结果" description={<pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{result}</pre>} />)}
    </div>
  );
});
