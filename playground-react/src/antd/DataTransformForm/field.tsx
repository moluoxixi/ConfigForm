/**
 * 场景 40：数据转换
 *
 * 覆盖：
 * - 提交前转换（transform）
 * - 显示时格式化（format）
 * - 输入时解析（parse）
 * - submitPath 路径映射
 * - 三种模式切换
 */
import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { FormProvider, FormField, useCreateForm } from '@moluoxixi/react';
import { setupAntd, StatusTabs } from '@moluoxixi/ui-antd';
import { Typography, Form, Input, Space, Tag } from 'antd';
import type { FieldInstance } from '@moluoxixi/core';

const { Title, Paragraph } = Typography;

setupAntd();

export const DataTransformForm = observer((): React.ReactElement => {
  const form = useCreateForm({
    initialValues: {
      priceCent: 9990,
      phoneRaw: '13800138000',
      fullName: '张三',
      tags: 'react,vue,typescript',
    },
  });

  useEffect(() => {
    form.createField({
      name: 'priceCent',
      label: '价格（分→元）',
      required: true,
      format: (v: unknown) => v ? (Number(v) / 100).toFixed(2) : '',
      parse: (v: unknown) => Math.round(Number(v) * 100),
      transform: (v: unknown) => Number(v),
    });
    form.createField({
      name: 'phoneRaw',
      label: '手机号（脱敏）',
      format: (v: unknown) => {
        const s = String(v ?? '');
        return s.length === 11 ? `${s.slice(0, 3)}****${s.slice(7)}` : s;
      },
      parse: (v: unknown) => String(v).replace(/\D/g, ''),
    });
    form.createField({ name: 'fullName', label: '姓名', required: true });
    form.createField({
      name: 'tags',
      label: '标签（逗号分隔）',
      description: '提交时转为数组',
      transform: (v: unknown) => String(v ?? '').split(',').map((s: string) => s.trim()).filter(Boolean),
    });
  }, []);

  return (
    <div>
      <Title level={3}>数据转换</Title>
      <Paragraph type="secondary">format（显示格式化） / parse（输入解析） / transform（提交转换）</Paragraph>
      <StatusTabs>
        {({ mode, showResult, showErrors }) => {
          form.pattern = mode;
          return (
          <FormProvider form={form}>
            {['priceCent', 'phoneRaw', 'fullName', 'tags'].map((name) => (
              <FormField key={name} name={name}>
                {(field: FieldInstance) => (
                  <Form.Item label={field.label} required={field.required} help={field.description}>
                    <Space>
                      <Input
                        value={String(field.value ?? '')}
                        onChange={(e) => field.setValue(e.target.value)}
                        disabled={mode === 'disabled'}
                        readOnly={mode === 'readOnly'}
                        style={{ width: 300 }}
                      />
                      <Tag color="blue">原始值: {JSON.stringify(field.value)}</Tag>
                    </Space>
                  </Form.Item>
                )}
              </FormField>
            ))}
          </FormProvider>
          );
        }}
      </StatusTabs>
    </div>
  );
});
