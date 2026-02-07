/**
 * 场景 1：基础表单
 *
 * 覆盖：
 * - Input / Password / Textarea / InputNumber / Select / RadioGroup / CheckboxGroup / Switch / DatePicker
 * - 三种模式切换（编辑态 / 阅读态 / 禁用态）
 */
import React from 'react';
import { observer } from 'mobx-react-lite';
import { setupAntd } from '@moluoxixi/ui-antd';
import { Typography } from 'antd';
import type { FormSchema } from '@moluoxixi/schema';
import { PlaygroundForm } from '../../components/PlaygroundForm';

const { Title, Paragraph } = Typography;

setupAntd();

/** 默认初始值 */
const INITIAL_VALUES: Record<string, unknown> = {
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
};

/** 表单 Schema */
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
        { pattern: /^[a-zA-Z0-9_]+$/, message: '仅允许字母、数字和下划线' },
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
      rules: [{ minLength: 8, message: '密码至少 8 个字符' }],
    },

    /* 邮箱 */
    email: {
      type: 'string',
      label: '邮箱',
      required: true,
      component: 'Input',
      wrapper: 'FormItem',
      placeholder: '请输入邮箱',
      rules: [{ format: 'email', message: '请输入有效邮箱' }],
    },

    /* 手机号 */
    phone: {
      type: 'string',
      label: '手机号',
      component: 'Input',
      wrapper: 'FormItem',
      placeholder: '请输入手机号',
      rules: [{ format: 'phone', message: '请输入有效手机号' }],
    },

    /* 年龄 */
    age: {
      type: 'number',
      label: '年龄',
      required: true,
      component: 'InputNumber',
      wrapper: 'FormItem',
      defaultValue: 18,
      componentProps: { min: 0, max: 150, step: 1 },
    },

    /* 性别 */
    gender: {
      type: 'string',
      label: '性别',
      component: 'Select',
      wrapper: 'FormItem',
      placeholder: '请选择',
      enum: [
        { label: '男', value: 'male' },
        { label: '女', value: 'female' },
        { label: '其他', value: 'other' },
      ],
    },

    /* 婚姻状况 */
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

    /* 兴趣爱好 */
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

    /* 通知开关 */
    notification: {
      type: 'boolean',
      label: '接收通知',
      component: 'Switch',
      wrapper: 'FormItem',
      defaultValue: true,
    },

    /* 日期 */
    birthday: {
      type: 'string',
      label: '生日',
      component: 'DatePicker',
      wrapper: 'FormItem',
      placeholder: '请选择日期',
    },

    /* 多行文本 */
    bio: {
      type: 'string',
      label: '个人简介',
      component: 'Textarea',
      wrapper: 'FormItem',
      placeholder: '不超过 200 字',
      rules: [{ maxLength: 200, message: '简介不超过 200 字' }],
    },
  },
};

/**
 * 基础表单示例
 *
 * 展示所有注册的 antd 组件类型，并支持三种模式切换。
 */
export const BasicForm = observer((): React.ReactElement => {
  return (
    <div>
      <Title level={3}>基础表单</Title>
      <Paragraph type="secondary">
        Input / Password / Textarea / InputNumber / Select / RadioGroup / CheckboxGroup / Switch / DatePicker
      </Paragraph>
      <PlaygroundForm schema={schema} initialValues={INITIAL_VALUES} />
    </div>
  );
});
