/**
 * 多表单协作 - antd 版
 *
 * 覆盖场景：
 * - 两个独立表单联合提交（用户信息 + 收货地址）
 * - 跨表单联动（省份→城市）
 * - 弹窗表单（antd Modal 内编辑子表单）
 */
import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { FormProvider, FormField, useCreateForm } from '@moluoxixi/react';
import { setupAntd } from '@moluoxixi/ui-antd';
import {
  Button, Typography, Alert, Input, Select, Form, Space, Card, Modal, Tag,
  Row, Col,
} from 'antd';
import { EditOutlined } from '@ant-design/icons';
import type { FieldInstance } from '@moluoxixi/core';

const { Title, Paragraph, Text } = Typography;

setupAntd();

/** 省市数据 */
const PROVINCE_CITY_MAP: Record<string, string[]> = {
  '北京': ['朝阳区', '海淀区', '东城区', '西城区', '丰台区'],
  '上海': ['浦东新区', '黄浦区', '徐汇区', '静安区', '长宁区'],
  '广东': ['广州', '深圳', '东莞', '佛山', '珠海'],
  '浙江': ['杭州', '宁波', '温州', '嘉兴', '绍兴'],
  '江苏': ['南京', '苏州', '无锡', '常州', '徐州'],
};

/** 通用字段行 */
const FieldRow = observer(({
  field,
  placeholder,
}: {
  field: FieldInstance;
  placeholder?: string;
}): React.ReactElement => (
  <Form.Item
    label={field.label}
    required={field.required}
    validateStatus={field.errors.length > 0 ? 'error' : undefined}
    help={field.errors[0]?.message}
  >
    <Input
      value={(field.value as string) ?? ''}
      onChange={(e) => field.setValue(e.target.value)}
      onFocus={() => field.focus()}
      onBlur={() => { field.blur(); field.validate('blur').catch(() => {}); }}
      placeholder={placeholder}
    />
  </Form.Item>
));

/**
 * 多表单协作示例
 */
export const MultiFormForm = observer(() => {
  /* 表单 1：用户信息 */
  const userForm = useCreateForm({
    initialValues: { name: '', phone: '', email: '' },
  });

  /* 表单 2：收货地址 */
  const addressForm = useCreateForm({
    initialValues: { province: '', city: '', street: '', zipCode: '' },
  });

  const [submitResult, setSubmitResult] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalSaved, setModalSaved] = useState(false);

  /* 创建用户表单字段 */
  useEffect(() => {
    userForm.createField({ name: 'name', label: '收件人', required: true, rules: [{ minLength: 2, message: '收件人至少 2 个字符' }] });
    userForm.createField({ name: 'phone', label: '手机号', required: true, rules: [{ format: 'phone', message: '请输入正确的手机号' }] });
    userForm.createField({ name: 'email', label: '邮箱', rules: [{ format: 'email', message: '请输入正确的邮箱' }] });
  }, []);

  /* 创建地址表单字段 */
  useEffect(() => {
    addressForm.createField({
      name: 'province',
      label: '省份',
      required: true,
      dataSource: Object.keys(PROVINCE_CITY_MAP).map((p) => ({ label: p, value: p })),
    });
    addressForm.createField({
      name: 'city',
      label: '城市',
      required: true,
      reactions: [
        {
          watch: 'province',
          fulfill: {
            run: (field, ctx) => {
              const province = ctx.values.province as string;
              const cities = province ? (PROVINCE_CITY_MAP[province] ?? []) : [];
              field.setDataSource(cities.map((c) => ({ label: c, value: c })));
              field.setValue('');
            },
          },
        },
      ],
    });
    addressForm.createField({ name: 'street', label: '详细地址', required: true, rules: [{ minLength: 5, message: '详细地址至少 5 个字符' }] });
    addressForm.createField({ name: 'zipCode', label: '邮政编码', rules: [{ pattern: /^\d{6}$/, message: '邮编 6 位数字' }] });
  }, []);

  /** 联合提交 */
  const handleCombinedSubmit = async (): Promise<void> => {
    const [userResult, addressResult] = await Promise.all([
      userForm.submit(),
      addressForm.submit(),
    ]);
    const allErrors = [...userResult.errors, ...addressResult.errors];
    if (allErrors.length > 0) {
      setSubmitResult('验证失败:\n' + allErrors.map((e) => `  - ${e.message}`).join('\n'));
      return;
    }
    setSubmitResult(JSON.stringify({ user: userResult.values, address: addressResult.values }, null, 2));
  };

  /** 重置 */
  const handleResetAll = (): void => {
    userForm.reset();
    addressForm.reset();
    setSubmitResult('');
    setModalSaved(false);
  };

  /** 弹窗保存 */
  const handleModalSave = async (): Promise<void> => {
    const result = await userForm.submit();
    if (result.errors.length > 0) return;
    setModalSaved(true);
    setShowModal(false);
  };

  return (
    <div>
      <Title level={3}>多表单协作 - antd 版</Title>
      <Paragraph type="secondary">
        两个独立表单联合提交 / 省份→城市联动 / antd Modal 弹窗表单
      </Paragraph>

      <Row gutter={24}>
        {/* 表单 1：用户信息 */}
        <Col span={12}>
          <Card
            title="用户信息"
            extra={
              <Space>
                {modalSaved && <Tag color="green">弹窗已保存</Tag>}
                <Button
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => setShowModal(true)}
                >
                  弹窗编辑
                </Button>
              </Space>
            }
          >
            <FormProvider form={userForm}>
              <FormField name="name">
                {(field: FieldInstance) => <FieldRow field={field} placeholder="请输入收件人" />}
              </FormField>
              <FormField name="phone">
                {(field: FieldInstance) => <FieldRow field={field} placeholder="请输入手机号" />}
              </FormField>
              <FormField name="email">
                {(field: FieldInstance) => <FieldRow field={field} placeholder="请输入邮箱" />}
              </FormField>
            </FormProvider>
          </Card>
        </Col>

        {/* 表单 2：收货地址 */}
        <Col span={12}>
          <Card title="收货地址">
            <FormProvider form={addressForm}>
              <FormField name="province">
                {(field: FieldInstance) => (
                  <Form.Item label={field.label} required={field.required} validateStatus={field.errors.length > 0 ? 'error' : undefined} help={field.errors[0]?.message}>
                    <Select
                      value={(field.value as string) || undefined}
                      onChange={(val) => field.setValue(val)}
                      placeholder="请选择省份"
                      style={{ width: '100%' }}
                      options={field.dataSource.map((item) => ({ label: item.label, value: item.value }))}
                    />
                  </Form.Item>
                )}
              </FormField>
              <FormField name="city">
                {(field: FieldInstance) => (
                  <Form.Item label={field.label} required={field.required} validateStatus={field.errors.length > 0 ? 'error' : undefined} help={field.errors[0]?.message}>
                    <Select
                      value={(field.value as string) || undefined}
                      onChange={(val) => field.setValue(val)}
                      placeholder={field.dataSource.length === 0 ? '请先选择省份' : '请选择城市'}
                      disabled={field.dataSource.length === 0}
                      style={{ width: '100%' }}
                      options={field.dataSource.map((item) => ({ label: item.label, value: item.value }))}
                    />
                  </Form.Item>
                )}
              </FormField>
              <FormField name="street">
                {(field: FieldInstance) => <FieldRow field={field} placeholder="请输入详细地址" />}
              </FormField>
              <FormField name="zipCode">
                {(field: FieldInstance) => <FieldRow field={field} placeholder="请输入邮编（6位数字）" />}
              </FormField>
            </FormProvider>
          </Card>
        </Col>
      </Row>

      {/* 联合操作 */}
      <Space style={{ marginTop: 16 }}>
        <Button type="primary" size="large" onClick={handleCombinedSubmit}>
          联合提交
        </Button>
        <Button size="large" onClick={handleResetAll}>
          全部重置
        </Button>
      </Space>

      {submitResult && (
        <Alert
          style={{ marginTop: 16 }}
          type={submitResult.startsWith('验证失败') ? 'error' : 'success'}
          message="联合提交结果"
          description={<pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: 12 }}>{submitResult}</pre>}
        />
      )}

      {/* antd Modal 弹窗表单 */}
      <Modal
        title="编辑用户信息"
        open={showModal}
        onOk={handleModalSave}
        onCancel={() => setShowModal(false)}
        okText="保存"
        cancelText="取消"
        destroyOnClose={false}
      >
        <FormProvider form={userForm}>
          <FormField name="name">
            {(field: FieldInstance) => <FieldRow field={field} placeholder="请输入收件人" />}
          </FormField>
          <FormField name="phone">
            {(field: FieldInstance) => <FieldRow field={field} placeholder="请输入手机号" />}
          </FormField>
          <FormField name="email">
            {(field: FieldInstance) => <FieldRow field={field} placeholder="请输入邮箱" />}
          </FormField>
        </FormProvider>
      </Modal>
    </div>
  );
});
