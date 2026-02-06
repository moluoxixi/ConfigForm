/**
 * 可编辑表格 - antd 版
 *
 * 覆盖场景：
 * - 基础增删（push / remove）
 * - 排序（moveUp / moveDown）
 * - 复制项（duplicate）
 * - 行内编辑表格（antd Table 风格）
 * - 最大/最小数量限制
 * - 嵌套数组（联系人→多个电话号码）
 */
import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { FormProvider, FormArrayField, useCreateForm } from '@moluoxixi/react';
import { setupAntd } from '@moluoxixi/ui-antd';
import {
  Button, Typography, Alert, Input, Select, Space, Card, Tag, Tooltip,
} from 'antd';
import {
  PlusOutlined, DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined,
  CopyOutlined, CloseOutlined,
} from '@ant-design/icons';
import type { ArrayFieldInstance } from '@moluoxixi/core';

const { Title, Paragraph, Text } = Typography;

setupAntd();

/** 联系人数据结构 */
interface ContactItem {
  name: string;
  role: string;
  phones: string[];
}

/** 角色选项 */
const ROLE_OPTIONS = [
  { label: '负责人', value: '负责人' },
  { label: '成员', value: '成员' },
  { label: '备用联系人', value: '备用' },
];

/** 联系人卡片 */
const ContactCard = observer(({
  index,
  contact,
  total,
  field,
}: {
  index: number;
  contact: ContactItem;
  total: number;
  field: ArrayFieldInstance;
}): React.ReactElement => {
  /** 更新联系人属性 */
  const updateContact = (patch: Partial<ContactItem>): void => {
    field.replace(index, { ...contact, ...patch });
  };

  /** 更新电话 */
  const updatePhone = (phoneIdx: number, value: string): void => {
    const phones = [...contact.phones];
    phones[phoneIdx] = value;
    updateContact({ phones });
  };

  /** 删除电话 */
  const removePhone = (phoneIdx: number): void => {
    updateContact({ phones: contact.phones.filter((_, i) => i !== phoneIdx) });
  };

  /** 添加电话 */
  const addPhone = (): void => {
    updateContact({ phones: [...contact.phones, ''] });
  };

  return (
    <Card
      size="small"
      style={{ marginBottom: 12 }}
      title={
        <Space>
          <Tag color="blue">#{index + 1}</Tag>
          <Text strong>{contact.name || '新联系人'}</Text>
          <Tag>{contact.role}</Tag>
        </Space>
      }
      extra={
        <Space size={4}>
          <Tooltip title="上移">
            <Button size="small" icon={<ArrowUpOutlined />} disabled={index === 0} onClick={() => field.moveUp(index)} />
          </Tooltip>
          <Tooltip title="下移">
            <Button size="small" icon={<ArrowDownOutlined />} disabled={index === total - 1} onClick={() => field.moveDown(index)} />
          </Tooltip>
          <Tooltip title="复制">
            <Button size="small" icon={<CopyOutlined />} disabled={!field.canAdd} onClick={() => field.duplicate(index)} />
          </Tooltip>
          <Tooltip title="删除">
            <Button size="small" danger icon={<DeleteOutlined />} disabled={!field.canRemove} onClick={() => field.remove(index)} />
          </Tooltip>
        </Space>
      }
    >
      {/* 姓名 + 角色 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <div>
          <Text type="secondary" style={{ fontSize: 12 }}>姓名</Text>
          <Input
            value={contact.name}
            onChange={(e) => updateContact({ name: e.target.value })}
            placeholder="请输入姓名"
            size="small"
          />
        </div>
        <div>
          <Text type="secondary" style={{ fontSize: 12 }}>角色</Text>
          <Select
            value={contact.role}
            onChange={(val) => updateContact({ role: val })}
            options={ROLE_OPTIONS}
            style={{ width: '100%' }}
            size="small"
          />
        </div>
      </div>

      {/* 嵌套电话数组 */}
      <div>
        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
          电话号码
        </Text>
        {contact.phones.map((phone, phoneIdx) => (
          <div key={phoneIdx} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
            <Input
              value={phone}
              onChange={(e) => updatePhone(phoneIdx, e.target.value)}
              placeholder="请输入电话号码"
              size="small"
              style={{ flex: 1 }}
            />
            <Button
              size="small"
              icon={<CloseOutlined />}
              disabled={contact.phones.length <= 1}
              onClick={() => removePhone(phoneIdx)}
            />
          </div>
        ))}
        <Button
          type="dashed"
          size="small"
          icon={<PlusOutlined />}
          onClick={addPhone}
          style={{ color: '#1677ff' }}
        >
          添加电话
        </Button>
      </div>
    </Card>
  );
});

/**
 * 可编辑表格示例
 */
export const ArrayFieldForm = observer(() => {
  const form = useCreateForm({
    initialValues: {
      contacts: [
        { name: '张三', role: '负责人', phones: ['13800138001'] },
      ] as ContactItem[],
    },
  });

  const [submitResult, setSubmitResult] = useState('');

  /* 创建数组字段 */
  useEffect(() => {
    form.createArrayField({
      name: 'contacts',
      label: '联系人',
      minItems: 1,
      maxItems: 5,
      itemTemplate: (): ContactItem => ({ name: '', role: '成员', phones: [''] }),
    });
  }, []);

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
      <Title level={3}>可编辑表格 - antd 版</Title>
      <Paragraph type="secondary">
        增删 / 排序 / 复制 / 嵌套数组（联系人→多电话）/ antd Card 展示
      </Paragraph>

      <FormProvider form={form}>
        <form onSubmit={handleSubmit} noValidate>
          <FormArrayField name="contacts">
            {(contactsField: ArrayFieldInstance) => {
              const items = (contactsField.value ?? []) as ContactItem[];
              return (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <Space>
                      <Text strong>联系人列表</Text>
                      <Tag>{items.length}/{contactsField.maxItems}</Tag>
                    </Space>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      size="small"
                      disabled={!contactsField.canAdd}
                      onClick={() => contactsField.push()}
                    >
                      添加联系人
                    </Button>
                  </div>

                  {items.map((contact, idx) => (
                    <ContactCard
                      key={idx}
                      index={idx}
                      contact={contact}
                      total={items.length}
                      field={contactsField}
                    />
                  ))}
                </div>
              );
            }}
          </FormArrayField>

          <Button type="primary" htmlType="submit" style={{ marginTop: 8 }}>
            提交
          </Button>
        </form>
      </FormProvider>

      {submitResult && (
        <Alert
          style={{ marginTop: 16 }}
          type={submitResult.startsWith('验证失败') ? 'error' : 'success'}
          message="结果"
          description={<pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{submitResult}</pre>}
        />
      )}
    </div>
  );
});
