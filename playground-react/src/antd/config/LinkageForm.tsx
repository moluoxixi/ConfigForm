/**
 * 字段联动 - antd 版
 *
 * 覆盖场景：
 * - 类型切换显隐（个人/企业切换不同字段）
 * - 一对多联动（一个字段影响多个字段的状态）
 * - 值计算联动（数量×单价→总价）
 * - 禁用联动（开关控制字段可编辑状态）
 */
import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { ConfigForm } from '@moluoxixi/react';
import { setupAntd } from '@moluoxixi/ui-antd';
import { Button, Space, Typography, Alert, Divider } from 'antd';
import type { FormSchema } from '@moluoxixi/schema';

const { Title, Paragraph } = Typography;

setupAntd();

/** 表单 Schema 定义 */
const schema: FormSchema = {
  form: {
    labelPosition: 'right',
    labelWidth: '120px',
  },
  fields: {
    /* ---- 场景 1：类型切换显隐 ---- */
    userType: {
      type: 'string',
      label: '用户类型',
      component: 'RadioGroup',
      wrapper: 'FormItem',
      required: true,
      defaultValue: 'personal',
      enum: [
        { label: '个人', value: 'personal' },
        { label: '企业', value: 'business' },
      ],
    },

    /* 个人用户字段 */
    realName: {
      type: 'string',
      label: '真实姓名',
      component: 'Input',
      wrapper: 'FormItem',
      required: true,
      placeholder: '请输入真实姓名',
      reactions: [
        {
          watch: 'userType',
          when: (values) => values[0] === 'personal',
          fulfill: { state: { visible: true } },
          otherwise: { state: { visible: false } },
        },
      ],
    },
    idCard: {
      type: 'string',
      label: '身份证号',
      component: 'Input',
      wrapper: 'FormItem',
      placeholder: '请输入身份证号',
      visible: true,
      rules: [{ pattern: /^\d{17}[\dXx]$/, message: '请输入有效的 18 位身份证号' }],
      reactions: [
        {
          watch: 'userType',
          when: (values) => values[0] === 'personal',
          fulfill: { state: { visible: true } },
          otherwise: { state: { visible: false } },
        },
      ],
    },

    /* 企业用户字段 */
    companyName: {
      type: 'string',
      label: '公司名称',
      component: 'Input',
      wrapper: 'FormItem',
      required: true,
      placeholder: '请输入公司名称',
      visible: false,
      reactions: [
        {
          watch: 'userType',
          when: (values) => values[0] === 'business',
          fulfill: { state: { visible: true } },
          otherwise: { state: { visible: false } },
        },
      ],
    },
    taxNumber: {
      type: 'string',
      label: '税号',
      component: 'Input',
      wrapper: 'FormItem',
      placeholder: '请输入纳税人识别号',
      visible: false,
      rules: [{ pattern: /^[0-9A-Z]{15,20}$/, message: '税号为 15-20 位字母数字' }],
      reactions: [
        {
          watch: 'userType',
          when: (values) => values[0] === 'business',
          fulfill: { state: { visible: true } },
          otherwise: { state: { visible: false } },
        },
      ],
    },
    companySize: {
      type: 'string',
      label: '公司规模',
      component: 'Select',
      wrapper: 'FormItem',
      visible: false,
      placeholder: '请选择公司规模',
      enum: [
        { label: '1-50 人', value: 'small' },
        { label: '50-200 人', value: 'medium' },
        { label: '200-1000 人', value: 'large' },
        { label: '1000 人以上', value: 'xlarge' },
      ],
      reactions: [
        {
          watch: 'userType',
          when: (values) => values[0] === 'business',
          fulfill: { state: { visible: true } },
          otherwise: { state: { visible: false } },
        },
      ],
    },

    /* ---- 场景 2：值计算联动 ---- */
    quantity: {
      type: 'number',
      label: '数量',
      component: 'InputNumber',
      wrapper: 'FormItem',
      defaultValue: 1,
      componentProps: { min: 1 },
    },
    unitPrice: {
      type: 'number',
      label: '单价',
      component: 'InputNumber',
      wrapper: 'FormItem',
      defaultValue: 0,
      componentProps: { min: 0, step: 0.01 },
    },
    totalPrice: {
      type: 'number',
      label: '总价',
      component: 'InputNumber',
      wrapper: 'FormItem',
      componentProps: { disabled: true },
      description: '自动计算：数量 × 单价',
      reactions: [
        {
          watch: ['quantity', 'unitPrice'],
          fulfill: {
            run: (field, ctx) => {
              const qty = (ctx.values.quantity as number) ?? 0;
              const price = (ctx.values.unitPrice as number) ?? 0;
              field.setValue(Math.round(qty * price * 100) / 100);
            },
          },
        },
      ],
    },

    /* ---- 场景 3：开关控制禁用状态 ---- */
    enableRemark: {
      type: 'boolean',
      label: '启用备注',
      component: 'Switch',
      wrapper: 'FormItem',
      defaultValue: false,
    },
    remark: {
      type: 'string',
      label: '备注',
      component: 'Textarea',
      wrapper: 'FormItem',
      placeholder: '请输入备注信息',
      disabled: true,
      reactions: [
        {
          watch: 'enableRemark',
          when: (values) => values[0] === true,
          fulfill: { state: { disabled: false } },
          otherwise: { state: { disabled: true } },
        },
      ],
    },

    /* 通用字段 */
    email: {
      type: 'string',
      label: '联系邮箱',
      component: 'Input',
      wrapper: 'FormItem',
      required: true,
      placeholder: '请输入邮箱',
      rules: [{ format: 'email', message: '请输入有效的邮箱地址' }],
    },
  },
};

/**
 * 字段联动示例
 *
 * 展示类型切换显隐、值计算联动、开关控制禁用等联动场景。
 */
export const LinkageForm = observer(() => {
  const [result, setResult] = useState('');

  return (
    <div>
      <Title level={3}>字段联动 - antd 组件</Title>
      <Paragraph type="secondary">
        切换「用户类型」看字段显隐 | 修改数量/单价看自动计算 | 开关控制备注启用状态
      </Paragraph>

      <ConfigForm
        schema={schema}
        initialValues={{
          userType: 'personal',
          realName: '',
          idCard: '',
          companyName: '',
          taxNumber: '',
          companySize: undefined,
          quantity: 1,
          unitPrice: 100,
          totalPrice: 100,
          enableRemark: false,
          remark: '',
          email: '',
        }}
        onSubmit={(values) => setResult(JSON.stringify(values, null, 2))}
        onSubmitFailed={(errors) =>
          setResult('验证失败:\n' + errors.map((e) => `[${e.path}] ${e.message}`).join('\n'))
        }
      >
        <Divider />
        <Space>
          <Button type="primary" htmlType="submit">
            提交
          </Button>
          <Button htmlType="reset">重置</Button>
        </Space>
      </ConfigForm>

      {result && (
        <Alert
          style={{ marginTop: 16 }}
          type={result.startsWith('验证失败') ? 'error' : 'success'}
          message="提交结果（隐藏字段已排除）"
          description={<pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{result}</pre>}
        />
      )}
    </div>
  );
});
