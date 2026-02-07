/**
 * 场景 36：树形选择
 *
 * 覆盖：
 * - antd TreeSelect 组件集成
 * - 异步加载子节点
 * - 多选 / 单选
 * - 三种模式切换
 */
import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { FormProvider, FormField, useCreateForm } from '@moluoxixi/react';
import { setupAntd, StatusTabs } from '@moluoxixi/ui-antd';
import { Typography, Form, Input, TreeSelect, Tag, Space } from 'antd';
import type { FieldInstance } from '@moluoxixi/core';

const { Title, Paragraph } = Typography;

setupAntd();

/** 组织树数据 */
const TREE_DATA = [
  { title: '总公司', value: 'root', children: [
    { title: '技术中心', value: 'tech', children: [
      { title: '前端组', value: 'frontend' },
      { title: '后端组', value: 'backend' },
      { title: '测试组', value: 'qa' },
    ] },
    { title: '产品中心', value: 'product', children: [
      { title: '产品设计', value: 'pd' },
      { title: '用户研究', value: 'ux' },
    ] },
    { title: '运营中心', value: 'operation', children: [
      { title: '市场部', value: 'market' },
      { title: '客服部', value: 'service' },
    ] },
  ] },
];

export const TreeSelectForm = observer((): React.ReactElement => {
  const form = useCreateForm({
    initialValues: { memberName: '', department: undefined, accessDepts: [] },
  });

  useEffect(() => {
    form.createField({ name: 'memberName', label: '成员姓名', required: true });
    form.createField({ name: 'department', label: '所属部门', required: true });
    form.createField({ name: 'accessDepts', label: '可访问部门（多选）' });
  }, []);

  return (
    <div>
      <Title level={3}>树形选择</Title>
      <Paragraph type="secondary">antd TreeSelect / 单选 + 多选 / 组织树结构 / 三种模式</Paragraph>
      <StatusTabs>
        {({ mode, showResult, showErrors }) => {
          form.pattern = mode;
          return (
          <FormProvider form={form}>
            <FormField name="memberName">
              {(field: FieldInstance) => (
                <Form.Item label={field.label} required={field.required}>
                  <Input value={(field.value as string) ?? ''} onChange={(e) => field.setValue(e.target.value)} disabled={mode === 'disabled'} readOnly={mode === 'readOnly'} style={{ width: 300 }} />
                </Form.Item>
              )}
            </FormField>

            <FormField name="department">
              {(field: FieldInstance) => (
                <Form.Item label={field.label} required={field.required}>
                  {mode === 'readOnly' ? (
                    <Tag color="blue">{(field.value as string) ?? '—'}</Tag>
                  ) : (
                    <TreeSelect
                      value={(field.value as string) ?? undefined}
                      onChange={(v) => field.setValue(v)}
                      treeData={TREE_DATA}
                      placeholder="请选择部门"
                      style={{ width: 300 }}
                      treeDefaultExpandAll
                      disabled={mode === 'disabled'}
                    />
                  )}
                </Form.Item>
              )}
            </FormField>

            <FormField name="accessDepts">
              {(field: FieldInstance) => (
                <Form.Item label={field.label}>
                  {mode === 'readOnly' ? (
                    <Space wrap>{((field.value as string[]) ?? []).map((v) => <Tag key={v} color="green">{v}</Tag>)}</Space>
                  ) : (
                    <TreeSelect
                      value={(field.value as string[]) ?? []}
                      onChange={(v) => field.setValue(v)}
                      treeData={TREE_DATA}
                      placeholder="请选择可访问部门"
                      style={{ width: '100%' }}
                      treeDefaultExpandAll
                      treeCheckable
                      showCheckedStrategy={TreeSelect.SHOW_CHILD}
                      disabled={mode === 'disabled'}
                    />
                  )}
                </Form.Item>
              )}
            </FormField>
          </FormProvider>
          );
        }}
      </StatusTabs>
    </div>
  );
});
