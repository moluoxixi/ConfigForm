/**
 * 场景 25：动态增删字段
 *
 * 覆盖：
 * - 运行时动态添加字段
 * - 运行时移除字段
 * - 动态字段参与验证和提交
 * - 三种模式切换
 */
import React, { useState, useCallback, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { FormField, useCreateForm } from '@moluoxixi/react';
import { setupAntd } from '@moluoxixi/ui-antd';
import {
  Button, Space, Typography, Input, Select, Form, Tag, Card,
} from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { FieldInstance } from '@moluoxixi/core';
import type { FieldPattern } from '@moluoxixi/shared';
import { PlaygroundForm } from '../../components/PlaygroundForm';

const { Title, Paragraph, Text } = Typography;

setupAntd();

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
  const [dynamicFields, setDynamicFields] = useState<DynamicFieldInfo[]>([]);
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldType, setNewFieldType] = useState('text');

  const form = useCreateForm({ initialValues: { title: '' } });

  useEffect(() => {
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
    });

    setDynamicFields((prev) => [...prev, info]);
    setNewFieldLabel('');
  }, [newFieldLabel, newFieldType, form]);

  /** 移除字段 */
  const removeField = useCallback((id: string): void => {
    form.removeField(id);
    setDynamicFields((prev) => prev.filter((f) => f.id !== id));
  }, [form]);

  /** 渲染动态字段组件 */
  const renderDynamicField = (field: FieldInstance, fieldType: string, mode: FieldPattern): React.ReactElement => {
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

      <PlaygroundForm form={form}>
        {({ mode }) => (
          <>
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
                      <div style={{ flex: 1 }}>{renderDynamicField(field, df.fieldType, mode)}</div>
                      {mode === 'editable' && (
                        <Button danger icon={<DeleteOutlined />} onClick={() => removeField(df.id)} />
                      )}
                    </Space>
                  </Form.Item>
                )}
              </FormField>
            ))}
          </>
        )}
      </PlaygroundForm>
    </div>
  );
});
