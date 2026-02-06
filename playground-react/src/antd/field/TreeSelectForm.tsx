/**
 * 场景 36：树形选择
 *
 * 覆盖：
 * - antd TreeSelect 组件集成
 * - 异步加载子节点
 * - 多选 / 单选
 * - 三种模式切换
 */
import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { FormProvider, FormField, useCreateForm } from '@moluoxixi/react';
import { setupAntd } from '@moluoxixi/ui-antd';
import { Button, Typography, Alert, Segmented, Form, Input, TreeSelect, Tag, Space } from 'antd';
import type { FieldInstance } from '@moluoxixi/core';
import type { FieldPattern } from '@moluoxixi/shared';

const { Title, Paragraph } = Typography;

setupAntd();

const MODE_OPTIONS = [
  { label: '编辑态', value: 'editable' },
  { label: '阅读态', value: 'readOnly' },
  { label: '禁用态', value: 'disabled' },
];

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
  const [mode, setMode] = useState<FieldPattern>('editable');
  const [result, setResult] = useState('');

  const form = useCreateForm({
    initialValues: { memberName: '', department: undefined, accessDepts: [] },
  });

  useEffect(() => {
    form.createField({ name: 'memberName', label: '成员姓名', required: true });
    form.createField({ name: 'department', label: '所属部门', required: true });
    form.createField({ name: 'accessDepts', label: '可访问部门（多选）' });
  }, []);

  const switchMode = (p: FieldPattern): void => {
    setMode(p);
    ['memberName', 'department', 'accessDepts'].forEach((n) => { const f = form.getField(n); if (f) f.pattern = p; });
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    const res = await form.submit();
    if (res.errors.length > 0) { setResult('验证失败: ' + res.errors.map((err) => err.message).join(', ')); }
    else { setResult(JSON.stringify(res.values, null, 2)); }
  };

  return (
    <div>
      <Title level={3}>树形选择</Title>
      <Paragraph type="secondary">antd TreeSelect / 单选 + 多选 / 组织树结构 / 三种模式</Paragraph>
      <Segmented value={mode} onChange={(v) => switchMode(v as FieldPattern)} options={MODE_OPTIONS} style={{ marginBottom: 16 }} />

      <FormProvider form={form}>
        <form onSubmit={handleSubmit} noValidate>
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

          {mode === 'editable' && (<Space><Button type="primary" htmlType="submit">提交</Button><Button onClick={() => form.reset()}>重置</Button></Space>)}
        </form>
      </FormProvider>

      {result && (<Alert style={{ marginTop: 16 }} type={result.startsWith('验证失败') ? 'error' : 'success'} message="提交结果" description={<pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{result}</pre>} />)}
    </div>
  );
});
