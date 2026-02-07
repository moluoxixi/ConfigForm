/**
 * 场景 11：自定义验证规则
 *
 * 覆盖：
 * - 正则验证（自定义 pattern）
 * - 自定义同步验证函数（validator）
 * - 多规则组合（stopOnFirstFailure）
 * - 警告级验证（level: 'warning'）
 * - 条件验证（动态切换规则）
 * - 三种模式切换
 */
import React from 'react';
import { observer } from 'mobx-react-lite';
import { ConfigForm } from '@moluoxixi/react';
import { setupAntd, StatusTabs } from '@moluoxixi/ui-antd';
import { Typography } from 'antd';
import type { ISchema } from '@moluoxixi/schema';
import type { FieldPattern } from '@moluoxixi/shared';

const { Title, Paragraph } = Typography;

setupAntd();

/** 工具：将 StatusTabs 的 mode 注入 schema */
function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } };
}

/** 中国大陆手机号正则 */
const CHINA_PHONE_REGEX = /^1[3-9]\d{9}$/;

/** 常见弱密码列表 */
const WEAK_PASSWORDS = ['12345678', 'password', 'qwerty123', 'abc12345', '11111111'];

/** 默认初始值 */
const INITIAL_VALUES: Record<string, unknown> = {
  licensePlate: '',
  phone: '',
  password: '',
  age: undefined,
  idType: 'idcard',
  idNumber: '',
  ipAddress: '',
};

/** 表单 Schema */
const schema: ISchema = {
  type: 'object',
  decoratorProps: { labelPosition: 'right', labelWidth: '150px' },
  properties: {
    /* ---- 自定义正则 ---- */
    licensePlate: {
      type: 'string',
      title: '车牌号',
      placeholder: '如：京A12345',
      rules: [
        {
          pattern: /^[\u4e00-\u9fa5][A-Z][A-Z0-9]{5}$/,
          message: '请输入有效车牌号（如：京A12345）',
        },
      ],
    },

    /* ---- 自定义验证函数 ---- */
    phone: {
      type: 'string',
      title: '手机号',
      required: true,
      placeholder: '请输入中国大陆手机号',
      rules: [
        {
          validator: (value) => {
            if (!value) return undefined;
            if (!CHINA_PHONE_REGEX.test(String(value))) {
              return '请输入有效的中国大陆手机号（1开头，11位数字）';
            }
            return undefined;
          },
        },
      ],
    },

    /* ---- 多规则组合 + stopOnFirstFailure ---- */
    password: {
      type: 'string',
      title: '密码',
      required: true,
      component: 'Password',
      placeholder: '8-32 位，含大小写和数字',
      rules: [
        {
          stopOnFirstFailure: true,
          minLength: 8,
          maxLength: 32,
          message: '密码长度 8-32 个字符',
        },
        {
          pattern: /[a-z]/,
          message: '需包含至少一个小写字母',
        },
        {
          pattern: /[A-Z]/,
          message: '需包含至少一个大写字母',
        },
        {
          pattern: /\d/,
          message: '需包含至少一个数字',
        },
        {
          validator: (value) => {
            if (WEAK_PASSWORDS.includes(String(value).toLowerCase())) {
              return '密码过于简单，请使用更复杂的密码';
            }
            return undefined;
          },
        },
      ],
    },

    /* ---- 警告级验证 ---- */
    age: {
      type: 'number',
      title: '年龄',
      required: true,
      componentProps: { min: 0, max: 150, style: { width: '100%' } },
      rules: [
        { min: 0, max: 150, message: '年龄范围 0-150' },
        {
          level: 'warning',
          validator: (value) => {
            const age = Number(value);
            if (age > 0 && age < 18) {
              return '未成年用户部分功能可能受限';
            }
            if (age > 60) {
              return '建议开启大字模式以获得更好体验';
            }
            return undefined;
          },
        },
      ],
    },

    /* ---- 条件验证：证件类型切换 ---- */
    idType: {
      type: 'string',
      title: '证件类型',
      required: true,
      default: 'idcard',
      enum: [
        { label: '身份证', value: 'idcard' },
        { label: '护照', value: 'passport' },
        { label: '军官证', value: 'military' },
      ],
    },
    idNumber: {
      type: 'string',
      title: '证件号码',
      required: true,
      placeholder: '请输入身份证号码',
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
                field.setComponentProps({ placeholder: '请输入 18 位身份证号' });
              } else if (idType === 'passport') {
                field.rules = [
                  { required: true, message: '请输入护照号码' },
                  { pattern: /^[A-Z]\d{8}$/, message: '护照格式：1 位大写字母 + 8 位数字' },
                ];
                field.setComponentProps({ placeholder: '如：E12345678' });
              } else {
                field.rules = [
                  { required: true, message: '请输入军官证号码' },
                  { minLength: 6, maxLength: 12, message: '军官证号码 6-12 位' },
                ];
                field.setComponentProps({ placeholder: '请输入军官证号码' });
              }
            },
          },
        },
      ],
    },

    /* ---- 自定义格式验证：IP 地址 ---- */
    ipAddress: {
      type: 'string',
      title: 'IP 地址',
      placeholder: '如：192.168.1.1',
      rules: [
        {
          validator: (value) => {
            if (!value) return undefined;
            const parts = String(value).split('.');
            if (parts.length !== 4) return 'IP 地址格式错误';
            for (const part of parts) {
              const num = Number(part);
              if (isNaN(num) || num < 0 || num > 255 || String(num) !== part) {
                return 'IP 地址各段必须为 0-255 的整数';
              }
            }
            return undefined;
          },
        },
      ],
    },
  },
};

/**
 * 自定义验证规则示例
 */
export const CustomValidationForm = observer((): React.ReactElement => {
  return (
    <div>
      <Title level={3}>自定义验证规则</Title>
      <Paragraph type="secondary">
        正则 / 自定义函数 / 多规则组合 / 警告级验证 / 条件切换规则 / IP 验证
      </Paragraph>
      <StatusTabs>
        {({ mode, showResult, showErrors }) => (
          <ConfigForm
            schema={withMode(schema, mode)}
            initialValues={INITIAL_VALUES}
            onSubmit={showResult}
            onSubmitFailed={(errors) => showErrors(errors)}
          />
        )}
      </StatusTabs>
    </div>
  );
});
