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
import React, { useState, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { ConfigForm } from '@moluoxixi/react';
import { setupAntd } from '@moluoxixi/ui-antd';
import { Button, Space, Typography, Alert, Segmented } from 'antd';
import type { FormSchema } from '@moluoxixi/schema';
import type { FieldPattern } from '@moluoxixi/shared';

const { Title, Paragraph } = Typography;

setupAntd();

/** 模式选项 */
const MODE_OPTIONS = [
  { label: '编辑态', value: 'editable' },
  { label: '阅读态', value: 'readOnly' },
  { label: '禁用态', value: 'disabled' },
];

/**
 * 构建 Schema
 *
 * @param mode - 表单模式
 */
function buildSchema(mode: FieldPattern): FormSchema {
  return {
    form: {
      labelPosition: 'right',
      labelWidth: '140px',
      pattern: mode,
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
}

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

/**
 * 必填与格式验证示例
 *
 * 展示 required / email / phone / url / pattern / minLength / min 等多种验证规则。
 */
export const BasicValidationForm = observer((): React.ReactElement => {
  const [mode, setMode] = useState<FieldPattern>('editable');
  const [result, setResult] = useState('');
  const [savedValues, setSavedValues] = useState<Record<string, unknown>>({ ...INITIAL_VALUES });

  const schema = useMemo(() => buildSchema(mode), [mode]);

  return (
    <div>
      <Title level={3}>必填与格式验证</Title>
      <Paragraph type="secondary">
        required / email / phone / URL / minLength / min-max / pattern 正则
      </Paragraph>

      <Segmented
        value={mode}
        onChange={(val) => setMode(val as FieldPattern)}
        options={MODE_OPTIONS}
        style={{ marginBottom: 16 }}
      />

      <ConfigForm
        key={mode}
        schema={schema}
        initialValues={savedValues}
        onValuesChange={(values) => setSavedValues(values as Record<string, unknown>)}
        onSubmit={(values) => setResult(JSON.stringify(values, null, 2))}
        onSubmitFailed={(errors) =>
          setResult('验证失败:\n' + errors.map((e) => `[${e.path}] ${e.message}`).join('\n'))
        }
      >
        {mode === 'editable' && (
          <Space style={{ marginTop: 16 }}>
            <Button type="primary" htmlType="submit">提交</Button>
            <Button htmlType="reset">重置</Button>
          </Space>
        )}
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
