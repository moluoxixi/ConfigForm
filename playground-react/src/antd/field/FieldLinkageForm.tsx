/**
 * 级联联动 - antd 版
 *
 * 覆盖场景：
 * - 省市级联（省份→城市→区县三级联动）
 * - 联系方式类型切换（手机/邮箱/微信切换验证规则和 placeholder）
 * - 使用 antd Select / Radio / Input
 */
import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { FormProvider, FormField, useCreateForm } from '@moluoxixi/react';
import { setupAntd } from '@moluoxixi/ui-antd';
import {
  Button, Typography, Alert, Select, Radio, Input, Form, Space, Divider, Tag,
} from 'antd';
import type { FieldInstance } from '@moluoxixi/core';

const { Title, Paragraph } = Typography;

setupAntd();

/* ======================== 三级地区数据 ======================== */

const PROVINCE_DATA: Record<string, Record<string, string[]>> = {
  '北京': {
    '朝阳区': ['三里屯', '望京', 'CBD'],
    '海淀区': ['中关村', '五道口', '西二旗'],
    '东城区': ['王府井', '东直门', '安定门'],
  },
  '上海': {
    '浦东新区': ['陆家嘴', '张江', '金桥'],
    '黄浦区': ['南京路', '人民广场', '外滩'],
    '徐汇区': ['徐家汇', '漕河泾', '田林'],
  },
  '广东': {
    '广州': ['天河', '越秀', '海珠'],
    '深圳': ['南山', '福田', '宝安'],
    '东莞': ['松山湖', '虎门', '长安'],
  },
};

/**
 * 级联联动示例
 */
export const FieldLinkageForm = observer(() => {
  const form = useCreateForm({
    initialValues: {
      province: undefined as string | undefined,
      city: undefined as string | undefined,
      district: undefined as string | undefined,
      contactType: 'phone',
      contact: '',
    },
  });

  /* 创建字段 */
  useEffect(() => {
    form.createField({
      name: 'province',
      label: '省份',
      required: true,
      dataSource: Object.keys(PROVINCE_DATA).map((p) => ({ label: p, value: p })),
    });

    form.createField({
      name: 'city',
      label: '城市/区',
      required: true,
      reactions: [
        {
          watch: 'province',
          fulfill: {
            run: (field, ctx) => {
              const province = ctx.values.province as string;
              const cities = province ? Object.keys(PROVINCE_DATA[province] ?? {}) : [];
              field.setDataSource(cities.map((c) => ({ label: c, value: c })));
              field.setValue(undefined);
            },
          },
        },
      ],
    });

    form.createField({
      name: 'district',
      label: '街道/区域',
      required: true,
      reactions: [
        {
          watch: ['province', 'city'],
          fulfill: {
            run: (field, ctx) => {
              const province = ctx.values.province as string;
              const city = ctx.values.city as string;
              const districts = province && city
                ? (PROVINCE_DATA[province]?.[city] ?? [])
                : [];
              field.setDataSource(districts.map((d) => ({ label: d, value: d })));
              field.setValue(undefined);
            },
          },
        },
      ],
    });

    form.createField({
      name: 'contactType',
      label: '联系方式类型',
      dataSource: [
        { label: '手机号', value: 'phone' },
        { label: '邮箱', value: 'email' },
        { label: '微信', value: 'wechat' },
      ],
    });

    form.createField({
      name: 'contact',
      label: '联系方式',
      required: true,
      reactions: [
        {
          watch: 'contactType',
          fulfill: {
            run: (field, ctx) => {
              const type = ctx.values.contactType as string;
              field.rules = [{ required: true }];
              if (type === 'phone') {
                field.rules.push({ format: 'phone', message: '请输入正确的手机号' });
                field.setComponentProps({ placeholder: '请输入手机号' });
              } else if (type === 'email') {
                field.rules.push({ format: 'email', message: '请输入正确的邮箱' });
                field.setComponentProps({ placeholder: '请输入邮箱地址' });
              } else {
                field.setComponentProps({ placeholder: '请输入微信号' });
              }
              field.setValue('');
              field.errors = [];
            },
          },
        },
      ],
    });
  }, []);

  const [result, setResult] = useState('');

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
      <Title level={3}>级联联动 - antd 版</Title>
      <Paragraph type="secondary">
        省市区三级级联 + 联系方式类型切换动态验证规则
      </Paragraph>

      <FormProvider form={form}>
        <form onSubmit={handleSubmit} noValidate>
          {/* 省份 */}
          <FormField name="province">
            {(field: FieldInstance) => (
              <Form.Item
                label={field.label}
                required={field.required}
                validateStatus={field.errors.length > 0 ? 'error' : undefined}
                help={field.errors[0]?.message}
              >
                <Select
                  value={field.value as string | undefined}
                  onChange={(val) => field.setValue(val)}
                  placeholder="请选择省份"
                  style={{ width: '100%' }}
                  options={field.dataSource.map((item) => ({ label: item.label, value: item.value }))}
                  allowClear
                />
              </Form.Item>
            )}
          </FormField>

          {/* 城市 */}
          <FormField name="city">
            {(field: FieldInstance) => (
              <Form.Item
                label={field.label}
                required={field.required}
                validateStatus={field.errors.length > 0 ? 'error' : undefined}
                help={field.errors[0]?.message}
              >
                <Select
                  value={field.value as string | undefined}
                  onChange={(val) => field.setValue(val)}
                  placeholder={field.dataSource.length === 0 ? '请先选择省份' : '请选择城市'}
                  disabled={field.dataSource.length === 0}
                  style={{ width: '100%' }}
                  options={field.dataSource.map((item) => ({ label: item.label, value: item.value }))}
                  allowClear
                />
              </Form.Item>
            )}
          </FormField>

          {/* 区域 */}
          <FormField name="district">
            {(field: FieldInstance) => (
              <Form.Item
                label={field.label}
                required={field.required}
                validateStatus={field.errors.length > 0 ? 'error' : undefined}
                help={field.errors[0]?.message}
              >
                <Select
                  value={field.value as string | undefined}
                  onChange={(val) => field.setValue(val)}
                  placeholder={field.dataSource.length === 0 ? '请先选择城市' : '请选择区域'}
                  disabled={field.dataSource.length === 0}
                  style={{ width: '100%' }}
                  options={field.dataSource.map((item) => ({ label: item.label, value: item.value }))}
                  allowClear
                />
              </Form.Item>
            )}
          </FormField>

          <Divider />

          {/* 联系方式类型 */}
          <FormField name="contactType">
            {(field: FieldInstance) => (
              <Form.Item label={field.label}>
                <Radio.Group
                  value={field.value as string}
                  onChange={(e) => field.setValue(e.target.value)}
                  options={field.dataSource.map((item) => ({ label: item.label, value: item.value as string }))}
                />
              </Form.Item>
            )}
          </FormField>

          {/* 联系方式 */}
          <FormField name="contact">
            {(field: FieldInstance) => (
              <Form.Item
                label={field.label}
                required={field.required}
                validateStatus={field.errors.length > 0 ? 'error' : undefined}
                help={field.errors[0]?.message}
              >
                <Input
                  value={(field.value as string) ?? ''}
                  onChange={(e) => field.setValue(e.target.value)}
                  onBlur={() => { field.blur(); field.validate('blur').catch(() => {}); }}
                  placeholder={(field.componentProps.placeholder as string) ?? '请输入'}
                />
              </Form.Item>
            )}
          </FormField>

          <Button type="primary" htmlType="submit">
            提交
          </Button>
        </form>
      </FormProvider>

      {result && (
        <Alert
          style={{ marginTop: 16 }}
          type={result.startsWith('验证失败') ? 'error' : 'success'}
          message="结果"
          description={<pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{result}</pre>}
        />
      )}
    </div>
  );
});
