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
import { FormField, useCreateForm } from '@moluoxixi/react';
import { setupAntd } from '@moluoxixi/ui-antd';
import { Typography, Form, Input, Transfer, Tag, Space } from 'antd';
import type { FieldInstance } from '@moluoxixi/core';
import { PlaygroundForm } from '../../components/PlaygroundForm';

const { Title, Paragraph } = Typography;

setupAntd();

/** 权限数据 */
const PERMISSIONS = Array.from({ length: 20 }, (_, i) => ({
  key: `perm-${i + 1}`,
  title: `权限${String(i + 1).padStart(2, '0')} - ${['查看', '编辑', '删除', '审核', '导出'][i % 5]}${['用户', '订单', '商品', '报表'][Math.floor(i / 5)]}`,
  description: `权限描述 ${i + 1}`,
}));

export const TransferForm = observer((): React.ReactElement => {
  const [targetKeys, setTargetKeys] = useState<string[]>(['perm-1', 'perm-3', 'perm-5']);

  const form = useCreateForm({ initialValues: { roleName: '管理员', permissions: ['perm-1', 'perm-3', 'perm-5'] } });

  useEffect(() => {
    form.createField({ name: 'roleName', label: '角色名称', required: true });
    form.createField({ name: 'permissions', label: '权限列表', required: true });
  }, []);

  const handleTransferChange = (keys: string[]): void => {
    setTargetKeys(keys);
    form.setFieldValue('permissions', keys);
  };

  return (
    <div>
      <Title level={3}>穿梭框</Title>
      <Paragraph type="secondary">antd Transfer / 权限分配 / 搜索过滤 / 三种模式</Paragraph>
      <PlaygroundForm form={form}>
        {({ mode }) => (
          <>
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
          </>
        )}
      </PlaygroundForm>
    </div>
  );
});
