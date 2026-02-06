/**
 * 基础表单 - antd 版
 *
 * 覆盖场景：
 * - 各类型字段（Input, InputNumber, Select, Password, Textarea, Switch, DatePicker）
 * - required 必填验证
 * - 格式验证（email, phone）
 * - 数值范围验证
 * - 正则验证
 * - 使用 setupAntd 注册组件 + wrapper: 'FormItem'
 */
import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { ConfigForm } from '@moluoxixi/react';
import { setupAntd } from '@moluoxixi/ui-antd';
import { Button, Space, Typography, Alert } from 'antd';
import type { FormSchema } from '@moluoxixi/schema';

const { Title, Paragraph } = Typography;

/* 初始化 antd 组件注册 */
setupAntd();

/** 表单 Schema 定义 */
const schema: FormSchema = {
  form: {
    labelPosition: 'right',
    labelWidth: '120px',
  },
  fields: {
    /* 文本输入 */
    username: {
      type: 'string',
      label: '用户名',
      required: true,
      component: 'Input',
      wrapper: 'FormItem',
      placeholder: '请输入用户名',
      rules: [
        { minLength: 3, maxLength: 20, message: '用户名长度 3-20 个字符' },
        { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线' },
      ],
    },

    /* 密码输入 */
    password: {
      type: 'string',
      label: '密码',
      required: true,
      component: 'Password',
      wrapper: 'FormItem',
      placeholder: '请输入密码',
      rules: [
        { minLength: 8, message: '密码至少 8 个字符' },
        {
          pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
          message: '密码需包含大写字母、小写字母和数字',
        },
      ],
    },

    /* 邮箱 */
    email: {
      type: 'string',
      label: '邮箱',
      required: true,
      component: 'Input',
      wrapper: 'FormItem',
      placeholder: '请输入邮箱地址',
      rules: [{ format: 'email', message: '请输入有效的邮箱地址' }],
    },

    /* 手机号 */
    phone: {
      type: 'string',
      label: '手机号',
      component: 'Input',
      wrapper: 'FormItem',
      placeholder: '请输入手机号码',
      rules: [{ format: 'phone', message: '请输入有效的手机号码' }],
    },

    /* 年龄（数字） */
    age: {
      type: 'number',
      label: '年龄',
      required: true,
      component: 'InputNumber',
      wrapper: 'FormItem',
      defaultValue: 18,
      componentProps: { min: 0, max: 150, step: 1 },
      rules: [{ min: 0, max: 150, message: '年龄范围 0-150' }],
    },

    /* 性别（下拉选择） */
    gender: {
      type: 'string',
      label: '性别',
      component: 'Select',
      wrapper: 'FormItem',
      placeholder: '请选择性别',
      enum: [
        { label: '男', value: 'male' },
        { label: '女', value: 'female' },
        { label: '其他', value: 'other' },
      ],
    },

    /* 婚姻状况（单选组） */
    marital: {
      type: 'string',
      label: '婚姻状况',
      component: 'RadioGroup',
      wrapper: 'FormItem',
      defaultValue: 'single',
      enum: [
        { label: '未婚', value: 'single' },
        { label: '已婚', value: 'married' },
        { label: '离异', value: 'divorced' },
      ],
    },

    /* 兴趣爱好（多选组） */
    hobbies: {
      type: 'array',
      label: '兴趣爱好',
      component: 'CheckboxGroup',
      wrapper: 'FormItem',
      defaultValue: [],
      enum: [
        { label: '阅读', value: 'reading' },
        { label: '运动', value: 'sports' },
        { label: '音乐', value: 'music' },
        { label: '旅行', value: 'travel' },
        { label: '编程', value: 'coding' },
      ],
    },

    /* 接收通知（开关） */
    notification: {
      type: 'boolean',
      label: '接收通知',
      component: 'Switch',
      wrapper: 'FormItem',
      defaultValue: true,
    },

    /* 生日（日期） */
    birthday: {
      type: 'string',
      label: '生日',
      component: 'DatePicker',
      wrapper: 'FormItem',
      placeholder: '请选择日期',
    },

    /* 个人简介（多行文本） */
    bio: {
      type: 'string',
      label: '个人简介',
      component: 'Textarea',
      wrapper: 'FormItem',
      placeholder: '请输入个人简介（不超过 200 字）',
      rules: [{ maxLength: 200, message: '简介不超过 200 个字符' }],
    },
  },
};

/**
 * 基础表单示例
 *
 * 通过 Schema 配置驱动，展示所有注册的 antd 组件类型。
 */
export const BasicForm = observer(() => {
  const [result, setResult] = useState('');

  return (
    <div>
      <Title level={3}>基础表单 - antd 组件</Title>
      <Paragraph type="secondary">
        通过 setupAntd 注册组件后，所有字段由 Schema 配置驱动，覆盖 Input / Password / InputNumber
        / Select / RadioGroup / CheckboxGroup / Switch / DatePicker / Textarea 全部组件类型
      </Paragraph>

      <ConfigForm
        schema={schema}
        initialValues={{
          username: '',
          password: '',
          email: '',
          phone: '',
          age: 18,
          gender: undefined,
          marital: 'single',
          hobbies: [],
          notification: true,
          birthday: '',
          bio: '',
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
