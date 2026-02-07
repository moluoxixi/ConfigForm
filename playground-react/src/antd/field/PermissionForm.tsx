/**
 * 场景 45：字段级权限控制
 *
 * 覆盖：
 * - 基于角色的字段可见性
 * - 字段读写权限
 * - 动态权限切换
 * - 三种模式切换
 */
import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { FormField, useCreateForm } from '@moluoxixi/react';
import { setupAntd } from '@moluoxixi/ui-antd';
import { Typography, Segmented, Form, Input, InputNumber, Space, Tag, Card } from 'antd';
import type { FieldInstance } from '@moluoxixi/core';
import { PlaygroundForm } from '../../components/PlaygroundForm';

const { Title, Paragraph, Text } = Typography;

setupAntd();

type Role = 'admin' | 'manager' | 'staff' | 'guest';

/** 角色权限矩阵 */
const PERMISSION_MATRIX: Record<string, Record<Role, 'hidden' | 'readOnly' | 'editable'>> = {
  name: { admin: 'editable', manager: 'editable', staff: 'editable', guest: 'readOnly' },
  email: { admin: 'editable', manager: 'editable', staff: 'readOnly', guest: 'hidden' },
  salary: { admin: 'editable', manager: 'readOnly', staff: 'hidden', guest: 'hidden' },
  department: { admin: 'editable', manager: 'editable', staff: 'readOnly', guest: 'readOnly' },
  level: { admin: 'editable', manager: 'readOnly', staff: 'hidden', guest: 'hidden' },
  remark: { admin: 'editable', manager: 'editable', staff: 'editable', guest: 'hidden' },
};

const FIELD_DEFS = [
  { name: 'name', label: '姓名', required: true },
  { name: 'email', label: '邮箱' },
  { name: 'salary', label: '薪资' },
  { name: 'department', label: '部门' },
  { name: 'level', label: '职级' },
  { name: 'remark', label: '备注' },
];

export const PermissionForm = observer((): React.ReactElement => {
  const [role, setRole] = useState<Role>('admin');

  const form = useCreateForm({
    initialValues: { name: '张三', email: 'zhangsan@company.com', salary: 25000, department: '技术部', level: 'P7', remark: '' },
  });

  useEffect(() => {
    FIELD_DEFS.forEach((d) => form.createField({ name: d.name, label: d.label, required: d.required }));
  }, []);

  /** 应用权限：根据角色和当前模式设置字段可见性和读写状态 */
  useEffect(() => {
    FIELD_DEFS.forEach((d) => {
      const field = form.getField(d.name);
      if (!field) return;
      const perm = PERMISSION_MATRIX[d.name]?.[role] ?? 'hidden';
      field.visible = perm !== 'hidden';
      if (form.pattern === 'editable') {
        field.pattern = perm === 'readOnly' ? 'readOnly' : 'editable';
      } else {
        field.pattern = form.pattern;
      }
    });
  }, [role, form.pattern, form]);

  return (
    <div>
      <Title level={3}>字段级权限控制</Title>
      <Paragraph type="secondary">基于角色的字段可见性 + 读写权限矩阵</Paragraph>

      <Space style={{ marginBottom: 16 }}>
        <Text strong>当前角色：</Text>
        <Segmented
          value={role}
          onChange={(v) => setRole(v as Role)}
          options={[
            { label: '管理员', value: 'admin' },
            { label: '经理', value: 'manager' },
            { label: '员工', value: 'staff' },
            { label: '访客', value: 'guest' },
          ]}
        />
      </Space>

      {/* 权限矩阵提示 */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Text strong>权限矩阵预览（当前角色：{role}）</Text>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
          {FIELD_DEFS.map((d) => {
            const perm = PERMISSION_MATRIX[d.name]?.[role] ?? 'hidden';
            const colors: Record<string, string> = { editable: 'green', readOnly: 'orange', hidden: 'red' };
            return <Tag key={d.name} color={colors[perm]}>{d.label}: {perm}</Tag>;
          })}
        </div>
      </Card>

      <PlaygroundForm form={form}>
        {({ mode }) => (
          <>
            {FIELD_DEFS.map((d) => (
              <FormField key={d.name} name={d.name}>
                {(field: FieldInstance) => {
                  if (!field.visible) return null;
                  const isFieldReadOnly = field.pattern === 'readOnly' || mode === 'readOnly';
                  const isFieldDisabled = field.pattern === 'disabled' || mode === 'disabled';
                  return (
                    <Form.Item label={field.label} required={field.required}>
                      {d.name === 'salary' ? (
                        <InputNumber value={field.value as number} onChange={(v) => field.setValue(v)} disabled={isFieldDisabled} readOnly={isFieldReadOnly} style={{ width: '100%' }} />
                      ) : d.name === 'remark' ? (
                        <Input.TextArea value={(field.value as string) ?? ''} onChange={(e) => field.setValue(e.target.value)} disabled={isFieldDisabled} readOnly={isFieldReadOnly} />
                      ) : (
                        <Input value={(field.value as string) ?? ''} onChange={(e) => field.setValue(e.target.value)} disabled={isFieldDisabled} readOnly={isFieldReadOnly} />
                      )}
                    </Form.Item>
                  );
                }}
              </FormField>
            ))}
          </>
        )}
      </PlaygroundForm>
    </div>
  );
});
