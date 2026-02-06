/**
 * 场景 35：穿梭框
 *
 * 覆盖：
 * - antd Transfer 组件集成
 * - 数据双向穿梭
 * - 搜索过滤
 * - 三种模式切换
 */
import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { FormProvider, FormField, useCreateForm } from '@moluoxixi/react';
import { setupAntd } from '@moluoxixi/ui-antd';
import { Button, Typography, Alert, Segmented, Form, Input, Transfer, Tag } from 'antd';
import type { FieldInstance } from '@moluoxixi/core';
import type { FieldPattern } from '@moluoxixi/shared';

const { Title, Paragraph } = Typography;

setupAntd();

const MODE_OPTIONS = [
  { label: '编辑态', value: 'editable' },
  { label: '阅读态', value: 'readOnly' },
  { label: '禁用态', value: 'disabled' },
];

/** 权限数据 */
const PERMISSIONS = Array.from({ length: 20 }, (_, i) => ({
  key: `perm-${i + 1}`,
  title: `权限${String(i + 1).padStart(2, '0')} - ${['查看', '编辑', '删除', '审核', '导出'][i % 5]}${['用户', '订单', '商品', '报表'][Math.floor(i / 5)]}`,
  description: `权限描述 ${i + 1}`,
}));

export const TransferForm = observer((): React.ReactElement => {
  const [mode, setMode] = useState<FieldPattern>('editable');
  const [result, setResult] = useState('');
  const [targetKeys, setTargetKeys] = useState<string[]>(['perm-1', 'perm-3', 'perm-5']);

  const form = useCreateForm({ initialValues: { roleName: '管理员', permissions: ['perm-1', 'perm-3', 'perm-5'] } });

  useEffect(() => {
    form.createField({ name: 'roleName', label: '角色名称', required: true });
    form.createField({ name: 'permissions', label: '权限列表', required: true });
  }, []);

  const switchMode = (p: FieldPattern): void => {
    setMode(p);
    ['roleName', 'permissions'].forEach((n) => { const f = form.getField(n); if (f) f.pattern = p; });
  };

  const handleTransferChange = (keys: string[]): void => {
    setTargetKeys(keys);
    form.setFieldValue('permissions', keys);
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    const res = await form.submit();
    if (res.errors.length > 0) { setResult('验证失败: ' + res.errors.map((err) => err.message).join(', ')); }
    else { setResult(JSON.stringify(res.values, null, 2)); }
  };

  return (
    <div>
      <Title level={3}>穿梭框</Title>
      <Paragraph type="secondary">antd Transfer / 权限分配 / 搜索过滤 / 三种模式</Paragraph>
      <Segmented value={mode} onChange={(v) => switchMode(v as FieldPattern)} options={MODE_OPTIONS} style={{ marginBottom: 16 }} />

      <FormProvider form={form}>
        <form onSubmit={handleSubmit} noValidate>
          <FormField name="roleName">
            {(field: FieldInstance) => (
              <Form.Item label={field.label} required={field.required}>
                <Input value={(field.value as string) ?? ''} onChange={(e) => field.setValue(e.target.value)} disabled={mode === 'disabled'} readOnly={mode === 'readOnly'} style={{ width: 300 }} />
              </Form.Item>
            )}
          </FormField>

          <Form.Item label="权限分配">
            {mode === 'readOnly' ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {targetKeys.map((key) => {
                  const perm = PERMISSIONS.find((p) => p.key === key);
                  return <Tag key={key} color="blue">{perm?.title ?? key}</Tag>;
                })}
              </div>
            ) : (
              <Transfer
                dataSource={PERMISSIONS}
                targetKeys={targetKeys}
                onChange={handleTransferChange}
                render={(item) => item.title}
                showSearch
                listStyle={{ width: 320, height: 340 }}
                titles={['可选权限', '已选权限']}
                disabled={mode === 'disabled'}
                filterOption={(input, item) => item.title.includes(input)}
              />
            )}
          </Form.Item>

          {mode === 'editable' && <Button type="primary" htmlType="submit">提交</Button>}
        </form>
      </FormProvider>

      {result && (<Alert style={{ marginTop: 16 }} type={result.startsWith('验证失败') ? 'error' : 'success'} message="提交结果" description={<pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{result}</pre>} />)}
    </div>
  );
});
