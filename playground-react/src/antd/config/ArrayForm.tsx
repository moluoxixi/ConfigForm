/**
 * 数组字段 - antd 版
 *
 * 覆盖场景：
 * - 数组增删（push / remove）
 * - 排序（moveUp / moveDown）
 * - 复制项（duplicate）
 * - 最大/最小数量限制
 * - 项内联动（数量×单价=小计）
 * - 汇总计算（总金额 + 折扣）
 * - 使用 FormProvider + FormField + FormArrayField
 */
import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { FormProvider, FormField, FormArrayField, useCreateForm } from '@moluoxixi/react';
import { setupAntd } from '@moluoxixi/ui-antd';
import {
  Button, Space, Typography, Alert, Input, InputNumber, Switch, Table, Tag,
} from 'antd';
import {
  PlusOutlined, DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined, CopyOutlined,
} from '@ant-design/icons';
import type { ArrayFieldInstance, FieldInstance } from '@moluoxixi/core';

const { Title, Paragraph, Text } = Typography;

setupAntd();

/** 订单项模板 */
const ORDER_ITEM_TEMPLATE = { productName: '', quantity: 1, unitPrice: 0, subtotal: 0 };

/** 最小/最大订单项数 */
const MIN_ORDER_ITEMS = 1;
const MAX_ORDER_ITEMS = 10;

/** 单个订单项行 */
const OrderItemRow = observer(({
  index,
  arrayField,
  form,
}: {
  index: number;
  arrayField: ArrayFieldInstance;
  form: ReturnType<typeof useCreateForm>;
}): React.ReactElement => {
  const basePath = `items.${index}`;
  const totalItems = ((arrayField.value as unknown[]) ?? []).length;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '2fr 100px 120px 100px auto',
        gap: 8,
        alignItems: 'center',
        padding: '8px 12px',
        background: index % 2 === 0 ? '#fafafa' : '#fff',
        borderRadius: 4,
      }}
    >
      {/* 商品名称 */}
      <FormField name={`${basePath}.productName`}>
        {(field: FieldInstance) => (
          <Input
            value={(field.value as string) ?? ''}
            onChange={(e) => field.setValue(e.target.value)}
            placeholder="商品名称"
            size="small"
          />
        )}
      </FormField>

      {/* 数量 */}
      <FormField name={`${basePath}.quantity`}>
        {(field: FieldInstance) => (
          <InputNumber
            value={(field.value as number) ?? 1}
            min={1}
            size="small"
            style={{ width: '100%' }}
            onChange={(val) => {
              const qty = val ?? 1;
              field.setValue(qty);
              const price = form.getFieldValue(`${basePath}.unitPrice`) as number;
              form.setFieldValue(`${basePath}.subtotal`, qty * (price || 0));
            }}
          />
        )}
      </FormField>

      {/* 单价 */}
      <FormField name={`${basePath}.unitPrice`}>
        {(field: FieldInstance) => (
          <InputNumber
            value={(field.value as number) ?? 0}
            min={0}
            step={0.01}
            size="small"
            style={{ width: '100%' }}
            onChange={(val) => {
              const price = val ?? 0;
              field.setValue(price);
              const qty = form.getFieldValue(`${basePath}.quantity`) as number;
              form.setFieldValue(`${basePath}.subtotal`, (qty || 0) * price);
            }}
          />
        )}
      </FormField>

      {/* 小计 */}
      <FormField name={`${basePath}.subtotal`}>
        {(field: FieldInstance) => (
          <Text strong type="success">
            ¥{((field.value as number) ?? 0).toFixed(2)}
          </Text>
        )}
      </FormField>

      {/* 操作 */}
      <Space size={4}>
        <Button
          size="small"
          icon={<ArrowUpOutlined />}
          disabled={index === 0}
          onClick={() => arrayField.moveUp(index)}
        />
        <Button
          size="small"
          icon={<ArrowDownOutlined />}
          disabled={index === totalItems - 1}
          onClick={() => arrayField.moveDown(index)}
        />
        <Button
          size="small"
          icon={<CopyOutlined />}
          disabled={!arrayField.canAdd}
          onClick={() => arrayField.duplicate(index)}
        />
        <Button
          size="small"
          danger
          icon={<DeleteOutlined />}
          disabled={!arrayField.canRemove}
          onClick={() => arrayField.remove(index)}
        />
      </Space>
    </div>
  );
});

/**
 * 数组字段示例
 *
 * 订单明细列表：增删 / 排序 / 复制 / 数量×单价联动 / 汇总 / 折扣
 */
export const ArrayForm = observer(() => {
  const form = useCreateForm({
    initialValues: {
      orderName: '',
      enableDiscount: false,
      discountRate: 10,
      items: [{ ...ORDER_ITEM_TEMPLATE }],
    },
  });

  const [result, setResult] = useState('');

  /* 创建字段 */
  React.useEffect(() => {
    form.createField({
      name: 'orderName',
      label: '订单名称',
      required: true,
      rules: [{ minLength: 2, message: '订单名称至少 2 个字符' }],
    });
    form.createField({ name: 'enableDiscount', label: '启用折扣' });
    form.createField({
      name: 'discountRate',
      label: '折扣比例',
      visible: false,
      rules: [{ min: 0, max: 100, message: '折扣比例 0-100' }],
      reactions: [
        {
          watch: 'enableDiscount',
          when: (values) => values[0] === true,
          fulfill: { state: { visible: true } },
          otherwise: { state: { visible: false } },
        },
      ],
    });
  }, []);

  /** 计算总金额 */
  const calculateTotal = (): number => {
    const items = (form.getFieldValue('items') ?? []) as Array<{ subtotal?: number }>;
    const rawTotal = items.reduce((sum, item) => sum + (item?.subtotal ?? 0), 0);
    const enableDiscount = form.getFieldValue('enableDiscount') as boolean;
    const discountRate = form.getFieldValue('discountRate') as number;

    if (enableDiscount && discountRate > 0) {
      return rawTotal * (1 - discountRate / 100);
    }
    return rawTotal;
  };

  /** 提交 */
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    const res = await form.submit();
    if (res.errors.length > 0) {
      setResult('验证失败: ' + res.errors.map((err) => err.message).join(', '));
    } else {
      setResult(JSON.stringify(
        { ...res.values, totalAmount: calculateTotal().toFixed(2) },
        null,
        2,
      ));
    }
  };

  return (
    <div>
      <Title level={3}>数组字段 - antd 组件</Title>
      <Paragraph type="secondary">
        增删 / 排序 / 复制 / min-max 限制 / 项内联动 / 汇总计算 / 折扣
      </Paragraph>

      <FormProvider form={form}>
        <form onSubmit={handleSubmit} noValidate>
          {/* 订单名称 */}
          <FormField name="orderName">
            {(field: FieldInstance) => (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
                  {field.label} <span style={{ color: 'red' }}>*</span>
                </label>
                <Input
                  value={(field.value as string) ?? ''}
                  onChange={(e) => field.setValue(e.target.value)}
                  onBlur={() => { field.blur(); field.validate('blur').catch(() => {}); }}
                  placeholder="请输入订单名称"
                  style={{ width: 300 }}
                  status={field.errors.length > 0 ? 'error' : undefined}
                />
                {field.errors.length > 0 && (
                  <div style={{ color: '#ff4d4f', fontSize: 12, marginTop: 4 }}>{field.errors[0].message}</div>
                )}
              </div>
            )}
          </FormField>

          {/* 折扣开关 */}
          <Space style={{ marginBottom: 16 }}>
            <FormField name="enableDiscount">
              {(field: FieldInstance) => (
                <Space>
                  <Switch
                    checked={!!field.value}
                    onChange={(checked) => field.setValue(checked)}
                  />
                  <span>{field.label}</span>
                </Space>
              )}
            </FormField>

            <FormField name="discountRate">
              {(field: FieldInstance) => {
                if (!field.visible) return null;
                return (
                  <Space>
                    <InputNumber
                      value={(field.value as number) ?? 0}
                      min={0}
                      max={100}
                      onChange={(val) => field.setValue(val ?? 0)}
                      addonAfter="%"
                      style={{ width: 130 }}
                    />
                  </Space>
                );
              }}
            </FormField>
          </Space>

          {/* 订单项列表 */}
          <FormArrayField
            name="items"
            fieldProps={{
              minItems: MIN_ORDER_ITEMS,
              maxItems: MAX_ORDER_ITEMS,
              itemTemplate: () => ({ ...ORDER_ITEM_TEMPLATE }),
            }}
          >
            {(arrayField: ArrayFieldInstance) => (
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Space>
                    <Text strong>订单明细</Text>
                    <Tag>
                      {((arrayField.value as unknown[]) ?? []).length}/{MAX_ORDER_ITEMS} 项
                    </Tag>
                  </Space>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    size="small"
                    disabled={!arrayField.canAdd}
                    onClick={() => arrayField.push({ ...ORDER_ITEM_TEMPLATE })}
                  >
                    添加商品
                  </Button>
                </div>

                {/* 表头 */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 100px 120px 100px auto',
                    gap: 8,
                    padding: '8px 12px',
                    background: '#f0f0f0',
                    borderRadius: '4px 4px 0 0',
                    fontWeight: 600,
                    fontSize: 13,
                  }}
                >
                  <span>商品名称</span>
                  <span>数量</span>
                  <span>单价（¥）</span>
                  <span>小计</span>
                  <span>操作</span>
                </div>

                {/* 行列表 */}
                {((arrayField.value as unknown[]) ?? []).map((_: unknown, idx: number) => (
                  <OrderItemRow key={idx} index={idx} arrayField={arrayField} form={form} />
                ))}

                {/* 汇总行 */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    gap: 16,
                    padding: 12,
                    background: '#f6ffed',
                    borderRadius: '0 0 4px 4px',
                    borderTop: '2px solid #52c41a',
                    marginTop: 4,
                  }}
                >
                  {(form.getFieldValue('enableDiscount') as boolean) && (
                    <Tag color="orange">折扣 {form.getFieldValue('discountRate') as number}%</Tag>
                  )}
                  <Text strong style={{ fontSize: 16 }}>
                    总金额：<Text type="success" style={{ fontSize: 20 }}>¥{calculateTotal().toFixed(2)}</Text>
                  </Text>
                </div>
              </div>
            )}
          </FormArrayField>

          <Button type="primary" htmlType="submit" size="large">
            提交订单
          </Button>
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
