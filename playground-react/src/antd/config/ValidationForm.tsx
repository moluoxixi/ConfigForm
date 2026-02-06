/**
 * 全场景验证 - antd 版
 *
 * 覆盖场景：
 * - 异步验证（模拟用户名唯一性检查）
 * - 内置格式验证（email / phone）
 * - 正则表达式验证
 * - 跨字段验证（密码确认 / 日期区间）
 * - 警告级验证（level: 'warning'）
 * - 动态验证规则（证件类型切换规则）
 * - 短路验证（stopOnFirstFailure）
 * - 数值范围验证
 */
import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { ConfigForm } from '@moluoxixi/react';
import { setupAntd } from '@moluoxixi/ui-antd';
import { Button, Space, Typography, Alert } from 'antd';
import type { FormSchema } from '@moluoxixi/schema';

const { Title, Paragraph } = Typography;

setupAntd();

/** 模拟已注册的用户名列表 */
const REGISTERED_USERNAMES = ['admin', 'test', 'root', 'user', 'demo'];

/** 异步验证延迟（ms） */
const ASYNC_CHECK_DELAY = 800;

/** 证件类型选项 */
const ID_TYPE_OPTIONS = [
  { label: '身份证', value: 'idcard' },
  { label: '护照', value: 'passport' },
  { label: '军官证', value: 'military' },
];

/** 表单 Schema 定义 */
const schema: FormSchema = {
  form: {
    labelPosition: 'right',
    labelWidth: '120px',
  },
  fields: {
    /* ---- 异步验证：用户名唯一性检查 ---- */
    username: {
      type: 'string',
      label: '用户名',
      required: true,
      component: 'Input',
      wrapper: 'FormItem',
      placeholder: '请输入用户名（试试 admin / test）',
      rules: [
        { minLength: 3, maxLength: 20, message: '用户名长度 3-20 个字符' },
        { pattern: /^[a-zA-Z0-9_]+$/, message: '只能包含字母、数字和下划线' },
        {
          asyncValidator: async (value, _rule, _context, signal) => {
            await new Promise<void>((resolve, reject) => {
              const timer = setTimeout(resolve, ASYNC_CHECK_DELAY);
              signal.addEventListener('abort', () => {
                clearTimeout(timer);
                reject(new Error('已取消'));
              });
            });
            if (REGISTERED_USERNAMES.includes(String(value).toLowerCase())) {
              return `用户名 "${value}" 已被注册`;
            }
          },
          trigger: 'blur',
          debounce: 300,
          message: '检查用户名可用性',
        },
      ],
    },

    /* ---- 格式验证 ---- */
    email: {
      type: 'string',
      label: '邮箱',
      required: true,
      component: 'Input',
      wrapper: 'FormItem',
      placeholder: '请输入邮箱地址',
      rules: [{ format: 'email', message: '请输入有效的邮箱地址' }],
    },
    phone: {
      type: 'string',
      label: '手机号',
      component: 'Input',
      wrapper: 'FormItem',
      placeholder: '请输入手机号码',
      rules: [
        { format: 'phone', message: '请输入有效的手机号码' },
        {
          level: 'warning',
          validator: (value) => {
            if (value && String(value).startsWith('170')) {
              return '170 号段可能存在接收验证码延迟的情况';
            }
          },
        },
      ],
    },

    /* ---- 数值范围验证 ---- */
    age: {
      type: 'number',
      label: '年龄',
      required: true,
      component: 'InputNumber',
      wrapper: 'FormItem',
      rules: [{ min: 0, max: 150, message: '年龄范围 0-150' }],
    },
    score: {
      type: 'number',
      label: '评分',
      component: 'InputNumber',
      wrapper: 'FormItem',
      description: '分数区间 (0, 100)，不含边界值',
      rules: [
        { exclusiveMin: 0, exclusiveMax: 100, message: '评分必须在 0 到 100 之间（不含边界）' },
      ],
    },

    /* ---- 跨字段验证：密码确认 ---- */
    password: {
      type: 'string',
      label: '密码',
      required: true,
      component: 'Password',
      wrapper: 'FormItem',
      placeholder: '请输入密码',
      rules: [
        {
          stopOnFirstFailure: true,
          minLength: 8,
          maxLength: 32,
          message: '密码长度 8-32 个字符',
        },
        {
          pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
          message: '需包含大写字母、小写字母和数字',
        },
        {
          level: 'warning',
          validator: (value) => {
            if (String(value).length < 12) {
              return '建议密码长度不少于 12 位以获得更高安全性';
            }
          },
        },
      ],
    },
    confirmPassword: {
      type: 'string',
      label: '确认密码',
      required: true,
      component: 'Password',
      wrapper: 'FormItem',
      placeholder: '请再次输入密码',
      rules: [
        {
          validator: (value, _rule, context) => {
            const pwd = context.getFieldValue('password');
            if (value !== pwd) return '两次输入的密码不一致';
          },
          trigger: 'blur',
        },
      ],
    },

    /* ---- 跨字段验证：日期区间 ---- */
    startDate: {
      type: 'string',
      label: '开始日期',
      required: true,
      component: 'DatePicker',
      wrapper: 'FormItem',
    },
    endDate: {
      type: 'string',
      label: '结束日期',
      required: true,
      component: 'DatePicker',
      wrapper: 'FormItem',
      rules: [
        {
          validator: (value, _rule, context) => {
            const start = context.getFieldValue('startDate') as string;
            if (start && value && String(value) < start) {
              return '结束日期不能早于开始日期';
            }
          },
          trigger: 'blur',
        },
        {
          level: 'warning',
          validator: (value, _rule, context) => {
            const start = context.getFieldValue('startDate') as string;
            if (start && value) {
              const diffMs = new Date(String(value)).getTime() - new Date(start).getTime();
              const diffDays = diffMs / (1000 * 60 * 60 * 24);
              if (diffDays > 365) return '日期跨度超过一年，请确认是否正确';
            }
          },
        },
      ],
    },

    /* ---- 动态验证规则：证件类型切换 ---- */
    idType: {
      type: 'string',
      label: '证件类型',
      required: true,
      component: 'Select',
      wrapper: 'FormItem',
      defaultValue: 'idcard',
      enum: ID_TYPE_OPTIONS,
    },
    idNumber: {
      type: 'string',
      label: '证件号码',
      required: true,
      component: 'Input',
      wrapper: 'FormItem',
      placeholder: '请输入证件号码',
      reactions: [
        {
          watch: 'idType',
          fulfill: {
            run: (field, ctx) => {
              const idType = ctx.values.idType as string;
              field.setValue('');
              field.errors = [];

              if (idType === 'idcard') {
                field.rules = [
                  { required: true, message: '请输入身份证号码' },
                  { pattern: /^\d{17}[\dXx]$/, message: '请输入有效的 18 位身份证号码' },
                ];
                field.setComponentProps({ placeholder: '请输入 18 位身份证号码' });
              } else if (idType === 'passport') {
                field.rules = [
                  { required: true, message: '请输入护照号码' },
                  { pattern: /^[A-Z]\d{8}$/, message: '护照格式：1 位大写字母 + 8 位数字' },
                ];
                field.setComponentProps({ placeholder: '如：E12345678' });
              } else {
                field.rules = [
                  { required: true, message: '请输入军官证号码' },
                  { minLength: 6, maxLength: 12, message: '军官证号码长度 6-12 位' },
                ];
                field.setComponentProps({ placeholder: '请输入军官证号码' });
              }
            },
          },
        },
      ],
    },
  },
};

/**
 * 全场景验证示例
 *
 * 综合展示异步验证、格式验证、跨字段验证、警告级验证、动态规则等高级验证场景。
 */
export const ValidationForm = observer(() => {
  const [result, setResult] = useState('');

  return (
    <div>
      <Title level={3}>全场景验证 - antd 组件</Title>
      <Paragraph type="secondary">
        异步验证 / 格式验证 / 数值范围 / 正则 / 跨字段 / 警告级 / 动态规则 / 短路验证
      </Paragraph>

      <ConfigForm
        schema={schema}
        initialValues={{
          username: '',
          email: '',
          phone: '',
          age: undefined,
          score: undefined,
          password: '',
          confirmPassword: '',
          startDate: '',
          endDate: '',
          idType: 'idcard',
          idNumber: '',
        }}
        onSubmit={(values) => setResult(JSON.stringify(values, null, 2))}
        onSubmitFailed={(errors) =>
          setResult('验证失败:\n' + errors.map((e) => `[${e.path}] ${e.message}`).join('\n'))
        }
      >
        <Space style={{ marginTop: 16 }}>
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
          message="提交结果"
          description={<pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{result}</pre>}
        />
      )}
    </div>
  );
});
