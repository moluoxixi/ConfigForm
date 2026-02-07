/**
 * 场景 3：必填与格式验证
 *
 * 覆盖：
 * - 必填校验（required）
 * - 邮箱格式校验（format: 'email'）
 * - 手机号格式校验（format: 'phone'）
 * - URL 格式校验（format: 'url'）
 * - 长度限制（minLength / maxLength）
 * - 数值范围（min / max）
 * - 正则校验（pattern）
 * - 三种模式切换
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
  email: '',
  phone: '',
  website: '',
  nickname: '',
  age: undefined,
  zipCode: '',
  idCard: '',
  password: '',
};

/** 表单 Schema */
const schema: FormSchema = {
  form: {
    labelPosition: 'right',
    labelWidth: '140px',
  },
  fields: {
    /* 必填 */
    username: {
      type: 'string',
      label: '用户名（必填）',
      required: true,
      component: 'Input',
      wrapper: 'FormItem',
      placeholder: '请输入用户名',
      rules: [
        { minLength: 3, maxLength: 20, message: '长度 3-20 个字符' },
      ],
    },

    /* 邮箱格式 */
    email: {
      type: 'string',
      label: '邮箱',
      required: true,
      component: 'Input',
      wrapper: 'FormItem',
      placeholder: '请输入邮箱地址',
      rules: [{ format: 'email', message: '请输入有效邮箱' }],
    },

    /* 手机号格式 */
    phone: {
      type: 'string',
      label: '手机号',
      required: true,
      component: 'Input',
      wrapper: 'FormItem',
      placeholder: '请输入 11 位手机号',
      rules: [{ format: 'phone', message: '请输入有效手机号' }],
    },

    /* URL 格式 */
    website: {
      type: 'string',
      label: '个人网站',
      component: 'Input',
      wrapper: 'FormItem',
      placeholder: 'https://example.com',
      rules: [{ format: 'url', message: '请输入有效的 URL 地址' }],
    },

    /* 长度限制 */
    nickname: {
      type: 'string',
      label: '昵称',
      component: 'Input',
      wrapper: 'FormItem',
      placeholder: '2-10 个字符',
      rules: [
        { minLength: 2, message: '昵称至少 2 个字符' },
        { maxLength: 10, message: '昵称最多 10 个字符' },
      ],
    },

    /* 数值范围 */
    age: {
      type: 'number',
      label: '年龄',
      required: true,
      component: 'InputNumber',
      wrapper: 'FormItem',
      componentProps: { min: 0, max: 150 },
      rules: [{ min: 1, max: 150, message: '年龄范围 1-150' }],
    },

    /* 正则校验 */
    zipCode: {
      type: 'string',
      label: '邮政编码',
      component: 'Input',
      wrapper: 'FormItem',
      placeholder: '6 位数字',
      rules: [{ pattern: /^\d{6}$/, message: '邮编为 6 位数字' }],
    },

    /* 身份证号 */
    idCard: {
      type: 'string',
      label: '身份证号',
      component: 'Input',
      wrapper: 'FormItem',
      placeholder: '18 位身份证号',
      rules: [
        { pattern: /^\d{17}[\dXx]$/, message: '请输入有效的 18 位身份证号' },
      ],
    },

    /* 多规则组合 */
    password: {
      type: 'string',
      label: '密码',
      required: true,
      component: 'Password',
      wrapper: 'FormItem',
      placeholder: '8-32 位，含大小写字母和数字',
      rules: [
        { minLength: 8, maxLength: 32, message: '密码长度 8-32 个字符' },
        {
          pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
          message: '需包含大写字母、小写字母和数字',
        },
      ],
    },
  },
};

/**
 * 必填与格式验证示例
 *
 * 展示 required / email / phone / url / pattern / minLength / min 等多种验证规则。
 */
export const BasicValidationForm = observer((): React.ReactElement => {
  return (
    <div>
      <Title level={3}>必填与格式验证</Title>
      <Paragraph type="secondary">
        required / email / phone / URL / minLength / min-max / pattern 正则
      </Paragraph>
      <PlaygroundForm schema={schema} initialValues={INITIAL_VALUES} />
    </div>
  );
});
