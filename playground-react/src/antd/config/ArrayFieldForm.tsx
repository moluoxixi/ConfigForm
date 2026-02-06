/**
 * 场景 15：数组字段
 *
 * 覆盖：
 * - 动态增删项（push / remove）
 * - 排序（moveUp / moveDown）
 * - 复制项（duplicate）
 * - 最大 / 最小数量限制
 * - 三种模式切换
 */
import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { FormProvider, FormField, FormArrayField, useCreateForm } from '@moluoxixi/react';
import { setupAntd } from '@moluoxixi/ui-antd';
import {
  Button, Space, Typography, Alert, Segmented, Input, Tag,
} from 'antd';
import { PlusOutlined, DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined, CopyOutlined } from '@ant-design/icons';
import type { ArrayFieldInstance, FieldInstance } from '@moluoxixi/core';
import type { FieldPattern } from '@moluoxixi/shared';

const { Title, Paragraph, Text } = Typography;

setupAntd();

/** 模式选项 */
const MODE_OPTIONS = [
  { label: '编辑态', value: 'editable' },
  { label: '阅读态', value: 'readOnly' },
  { label: '禁用态', value: 'disabled' },
];

/** 数组限制 */
const MIN_ITEMS = 1;
const MAX_ITEMS = 8;

/** 联系人模板 */
const CONTACT_TEMPLATE = { name: '', phone: '', email: '' };

/**
 * 单行联系人
 */
const ContactRow = observer(({
  index,
  arrayField,
  pattern,
}: {
  index: number;
  arrayField: ArrayFieldInstance;
  pattern: FieldPattern;
}): React.ReactElement => {
  const total = ((arrayField.value as unknown[]) ?? []).length;
  const basePath = `contacts.${index}`;
  const isEditable = pattern === 'editable';

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '40px 1fr 1fr 1fr auto',
        gap: 8,
        alignItems: 'center',
        padding: '8px 12px',
        background: index % 2 === 0 ? '#fafafa' : '#fff',
        borderRadius: 4,
      }}
    >
      <Text type="secondary">#{index + 1}</Text>
      <FormField name={`${basePath}.name`}>
        {(field: FieldInstance) => (
          <Input
            value={(field.value as string) ?? ''}
            onChange={(e) => field.setValue(e.target.value)}
            placeholder="姓名"
            size="small"
            disabled={pattern === 'disabled'}
            readOnly={pattern === 'readOnly'}
          />
        )}
      </FormField>
      <FormField name={`${basePath}.phone`}>
        {(field: FieldInstance) => (
          <Input
            value={(field.value as string) ?? ''}
            onChange={(e) => field.setValue(e.target.value)}
            placeholder="电话"
            size="small"
            disabled={pattern === 'disabled'}
            readOnly={pattern === 'readOnly'}
          />
        )}
      </FormField>
      <FormField name={`${basePath}.email`}>
        {(field: FieldInstance) => (
          <Input
            value={(field.value as string) ?? ''}
            onChange={(e) => field.setValue(e.target.value)}
            placeholder="邮箱"
            size="small"
            disabled={pattern === 'disabled'}
            readOnly={pattern === 'readOnly'}
          />
        )}
      </FormField>
      {isEditable && (
        <Space size={4}>
          <Button size="small" icon={<ArrowUpOutlined />} disabled={index === 0} onClick={() => arrayField.moveUp(index)} />
          <Button size="small" icon={<ArrowDownOutlined />} disabled={index === total - 1} onClick={() => arrayField.moveDown(index)} />
          <Button size="small" icon={<CopyOutlined />} disabled={!arrayField.canAdd} onClick={() => arrayField.duplicate(index)} />
          <Button size="small" danger icon={<DeleteOutlined />} disabled={!arrayField.canRemove} onClick={() => arrayField.remove(index)} />
        </Space>
      )}
    </div>
  );
});

/**
 * 数组字段示例
 */
export const ArrayFieldForm = observer((): React.ReactElement => {
  const [mode, setMode] = useState<FieldPattern>('editable');
  const [result, setResult] = useState('');

  const form = useCreateForm({
    initialValues: {
      groupName: '默认分组',
      contacts: [{ ...CONTACT_TEMPLATE }],
    },
  });

  React.useEffect(() => {
    form.createField({ name: 'groupName', label: '分组名称', required: true });
  }, []);

  /** 切换模式 */
  const switchMode = (p: FieldPattern): void => {
    setMode(p);
    const field = form.getField('groupName');
    if (field) field.pattern = p;
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

  return (
    <div>
      <Title level={3}>数组字段</Title>
      <Paragraph type="secondary">
        增删 / 排序 / 复制 / min={MIN_ITEMS} max={MAX_ITEMS} 数量限制
      </Paragraph>

      <Segmented
        value={mode}
        onChange={(val) => switchMode(val as FieldPattern)}
        options={MODE_OPTIONS}
        style={{ marginBottom: 16 }}
      />

      <FormProvider form={form}>
        <form onSubmit={handleSubmit} noValidate>
          {/* 分组名称 */}
          <FormField name="groupName">
            {(field: FieldInstance) => (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
                  {field.label} <span style={{ color: 'red' }}>*</span>
                </label>
                <Input
                  value={(field.value as string) ?? ''}
                  onChange={(e) => field.setValue(e.target.value)}
                  onBlur={() => { field.blur(); field.validate('blur').catch(() => {}); }}
                  placeholder="请输入分组名称"
                  style={{ width: 300 }}
                  disabled={mode === 'disabled'}
                  readOnly={mode === 'readOnly'}
                  status={field.errors.length > 0 ? 'error' : undefined}
                />
                {field.errors.length > 0 && (
                  <div style={{ color: '#ff4d4f', fontSize: 12, marginTop: 4 }}>{field.errors[0].message}</div>
                )}
              </div>
            )}
          </FormField>

          {/* 联系人列表 */}
          <FormArrayField
            name="contacts"
            fieldProps={{ minItems: MIN_ITEMS, maxItems: MAX_ITEMS, itemTemplate: () => ({ ...CONTACT_TEMPLATE }) }}
          >
            {(arrayField: ArrayFieldInstance) => (
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Space>
                    <Text strong>联系人列表</Text>
                    <Tag>{((arrayField.value as unknown[]) ?? []).length}/{MAX_ITEMS}</Tag>
                  </Space>
                  {mode === 'editable' && (
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      size="small"
                      disabled={!arrayField.canAdd}
                      onClick={() => arrayField.push({ ...CONTACT_TEMPLATE })}
                    >
                      添加联系人
                    </Button>
                  )}
                </div>

                {/* 表头 */}
                <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 1fr 1fr auto', gap: 8, padding: '8px 12px', background: '#f0f0f0', borderRadius: '4px 4px 0 0', fontWeight: 600, fontSize: 13 }}>
                  <span>#</span><span>姓名</span><span>电话</span><span>邮箱</span>
                  {mode === 'editable' && <span>操作</span>}
                </div>

                {((arrayField.value as unknown[]) ?? []).map((_: unknown, idx: number) => (
                  <ContactRow key={idx} index={idx} arrayField={arrayField} pattern={mode} />
                ))}
              </div>
            )}
          </FormArrayField>

          {mode === 'editable' && (
            <Button type="primary" htmlType="submit">提交</Button>
          )}
        </form>
      </FormProvider>

      {result && (
        <Alert
          style={{ marginTop: 16 }}
          type={result.startsWith('验证失败') ? 'error' : 'success'}
          message="提交结果"
          description={<pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{result}</pre>}
        />
      )}
    </div>
  );
});
